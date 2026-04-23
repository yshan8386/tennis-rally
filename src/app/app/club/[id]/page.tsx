import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  MapPin,
  MessageSquare,
  Pin,
  Plus,
  Settings,
  Trophy,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { approveMember, rejectMember, createMeeting, createNotice, createPost, removeMember } from "@/app/app/actions";
import type { MeetingFormState, NoticeFormState, PostFormState } from "@/app/app/actions";
import { CreateMeetingForm } from "@/components/app/create-meeting-form";

type TabKey = "meeting" | "notices" | "tournaments" | "board" | "members";

const TAB_LABELS: Record<TabKey, string> = {
  meeting: "모임",
  notices: "공지",
  tournaments: "대회",
  board: "게시판",
  members: "클럽원",
};

function VoteBar({ attend, undecided, absent }: { attend: number; undecided: number; absent: number }) {
  const total = attend + undecided + absent;
  if (total === 0) return <p className="text-xs text-zinc-400">아직 투표 없음</p>;
  return (
    <div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-zinc-100">
        <div className="bg-emerald-500" style={{ width: `${(attend / total) * 100}%` }} />
        <div className="bg-amber-400" style={{ width: `${(undecided / total) * 100}%` }} />
        <div className="bg-rose-400" style={{ width: `${(absent / total) * 100}%` }} />
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        <span className="text-emerald-600">참석 {attend}</span> · 미정 {undecided} · 불참 {absent}
      </p>
    </div>
  );
}

export default async function ClubDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id: clubId } = await params;
  const { tab = "meeting" } = await searchParams;
  const activeTab = (Object.keys(TAB_LABELS).includes(tab) ? tab : "meeting") as TabKey;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: club }, { data: membership }] = await Promise.all([
    supabase.from("clubs").select("id, name, type, city, description").eq("id", clubId).single(),
    supabase
      .from("club_members")
      .select("role, status")
      .eq("club_id", clubId)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!club || !membership || membership.status !== "active") redirect("/app/club");

  const isAdmin = membership.role === "owner" || membership.role === "admin";
  const isOwner = membership.role === "owner";

  // ── 탭별 데이터 페치 ──────────────────────────
  let meetings: any[] = [];
  let notices: any[] = [];
  let tournaments: any[] = [];
  let posts: any[] = [];
  let members: any[] = [];
  let pendingMembers: any[] = [];

  if (activeTab === "meeting") {
    const { data } = await supabase
      .from("meetings")
      .select("id, meeting_date, starts_at, location, status, vote_closes_at")
      .eq("club_id", clubId)
      .order("meeting_date", { ascending: false })
      .limit(20);
    meetings = data ?? [];

    // 각 모임의 투표 집계
    await Promise.all(
      meetings.map(async (m: any) => {
        const { data: votes } = await supabase
          .from("meeting_votes")
          .select("status")
          .eq("meeting_id", m.id);
        m._votes = {
          attend: votes?.filter((v) => v.status === "attend").length ?? 0,
          undecided: votes?.filter((v) => v.status === "undecided").length ?? 0,
          absent: votes?.filter((v) => v.status === "absent").length ?? 0,
        };
      }),
    );
  }

  if (activeTab === "notices") {
    const { data } = await supabase
      .from("club_notices")
      .select("id, title, content, is_pinned, published_at, users(name)")
      .eq("club_id", clubId)
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(30);
    notices = data ?? [];
  }

  if (activeTab === "tournaments") {
    const { data } = await supabase
      .from("tournaments")
      .select("id, name, tournament_date, location, status, entry_fee")
      .eq("club_id", clubId)
      .order("tournament_date", { ascending: false })
      .limit(20);
    tournaments = data ?? [];
  }

  if (activeTab === "board") {
    const { data } = await supabase
      .from("posts")
      .select("id, title, created_at, view_count, users(name)")
      .eq("club_id", clubId)
      .order("created_at", { ascending: false })
      .limit(30);
    posts = data ?? [];
  }

  if (activeTab === "members") {
    const [{ data: activeMembers }, { data: pending }] = await Promise.all([
      supabase
        .from("club_members")
        .select("user_id, role, joined_at, users(name, city, tennis_start_year, tennis_start_month)")
        .eq("club_id", clubId)
        .eq("status", "active")
        .order("joined_at", { ascending: true }),
      isAdmin
        ? supabase
            .from("club_members")
            .select("user_id, requested_at, users(name, city)")
            .eq("club_id", clubId)
            .eq("status", "pending")
            .order("requested_at", { ascending: true })
        : { data: [] },
    ]);
    members = activeMembers ?? [];
    pendingMembers = pending ?? [];
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      voting: { label: "투표중", className: "bg-rose-100 text-rose-600" },
      confirmed: { label: "확정", className: "bg-emerald-100 text-emerald-700" },
      completed: { label: "완료", className: "bg-zinc-100 text-zinc-500" },
      scheduled: { label: "예정", className: "bg-sky-100 text-sky-700" },
      upcoming: { label: "예정", className: "bg-sky-100 text-sky-700" },
      ongoing: { label: "진행중", className: "bg-amber-100 text-amber-700" },
      cancelled: { label: "취소", className: "bg-zinc-100 text-zinc-400" },
    };
    const s = map[status] ?? { label: status, className: "bg-zinc-100 text-zinc-500" };
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.className}`}>
        {s.label}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-[#f6fbf4] pb-24">
      {/* 헤더 */}
      <header className="flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Link href="/app/club" className="mr-1 text-zinc-400">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <p className="font-bold leading-tight">{club.name}</p>
            <p className="text-xs text-zinc-500">
              {club.city} · {club.type === "club" ? "클럽" : "학원"}
            </p>
          </div>
        </div>
        {isAdmin && (
          <Link href={`/app/club/${clubId}/settings`} className="text-zinc-400">
            <Settings className="size-5" />
          </Link>
        )}
      </header>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-zinc-100 bg-white">
        {(Object.keys(TAB_LABELS) as TabKey[]).map((t) => (
          <Link
            key={t}
            href={`/app/club/${clubId}?tab=${t}`}
            className={`flex-1 py-2.5 text-center text-xs font-semibold transition-colors ${
              activeTab === t
                ? "border-b-2 border-emerald-600 text-emerald-600"
                : "text-zinc-400"
            }`}
          >
            {TAB_LABELS[t]}
          </Link>
        ))}
      </div>

      <div className="px-4 py-4">
        {/* ── 모임 탭 ── */}
        {activeTab === "meeting" && (
          <div className="space-y-3">
            {isAdmin && (
              <CreateMeetingForm clubId={clubId} />
            )}

            {meetings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-center">
                <p className="text-sm text-zinc-500">예정된 모임이 없습니다.</p>
              </div>
            ) : (
              meetings.map((m: any) => (
                <Link
                  key={m.id}
                  href={`/app/club/${clubId}/meeting/${m.id}`}
                  className="block rounded-2xl border border-zinc-100 bg-white p-4 hover:border-emerald-200 transition-colors"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {format(new Date(m.meeting_date), "M월 d일 (EEE)", { locale: ko })} 정기모임
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                        <MapPin className="size-3" />
                        <span>{m.location}</span>
                        {m.starts_at && <span>· {m.starts_at.slice(0, 5)}</span>}
                      </div>
                    </div>
                    {statusBadge(m.status)}
                  </div>
                  {m._votes && (
                    <VoteBar
                      attend={m._votes.attend}
                      undecided={m._votes.undecided}
                      absent={m._votes.absent}
                    />
                  )}
                  <div className="mt-2 text-right">
                    <span className="text-xs text-emerald-600 font-medium">
                      {m.status === "voting"
                        ? "투표하기 →"
                        : m.status === "confirmed"
                        ? "대진표 보기 →"
                        : "결과 보기 →"}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* ── 공지 탭 ── */}
        {activeTab === "notices" && (
          <div className="space-y-3">
            {isAdmin && (
              <Link
                href={`/app/club/${clubId}/notice/new`}
                className={buttonVariants({
                  className: "w-full rounded-xl gap-2",
                  variant: "outline",
                })}
              >
                <Plus className="size-4" />
                공지 작성
              </Link>
            )}

            {notices.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-center">
                <p className="text-sm text-zinc-500">공지사항이 없습니다.</p>
              </div>
            ) : (
              notices.map((n: any) => (
                <div
                  key={n.id}
                  className="rounded-2xl border border-zinc-100 bg-white p-4"
                >
                  <div className="flex items-start gap-2">
                    {n.is_pinned && (
                      <Pin className="mt-0.5 size-3.5 flex-shrink-0 text-amber-500" />
                    )}
                    <div>
                      <p className="font-semibold leading-snug">{n.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {(n.users as unknown as { name: string } | null)?.name} ·{" "}
                        {format(new Date(n.published_at), "yyyy.MM.dd")}
                      </p>
                      <p className="mt-2 text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                        {n.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── 대회 탭 ── */}
        {activeTab === "tournaments" && (
          <div className="space-y-3">
            {isAdmin && (
              <Link
                href={`/app/club/${clubId}/tournament/new`}
                className={buttonVariants({
                  className: "w-full rounded-xl gap-2",
                  variant: "outline",
                })}
              >
                <Plus className="size-4" />
                대회 개설
              </Link>
            )}

            {tournaments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-center">
                <p className="text-sm text-zinc-500">등록된 대회가 없습니다.</p>
              </div>
            ) : (
              tournaments.map((t: any) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-zinc-100 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                        <CalendarDays className="size-3" />
                        <span>{format(new Date(t.tournament_date), "yyyy.MM.dd")}</span>
                        {t.location && <><MapPin className="size-3 ml-1" /><span>{t.location}</span></>}
                      </div>
                      {t.entry_fee > 0 && (
                        <p className="mt-1 text-xs text-zinc-400">참가비 {t.entry_fee.toLocaleString()}원</p>
                      )}
                    </div>
                    {statusBadge(t.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── 게시판 탭 ── */}
        {activeTab === "board" && (
          <div className="space-y-3">
            <Link
              href={`/app/club/${clubId}/board/new`}
              className={buttonVariants({
                className: "w-full rounded-xl gap-2",
                variant: "outline",
              })}
            >
              <Plus className="size-4" />
              글쓰기
            </Link>

            {posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-center">
                <p className="text-sm text-zinc-500">게시글이 없습니다.</p>
              </div>
            ) : (
              posts.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/app/club/${clubId}/board/${p.id}`}
                  className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-white px-4 py-3 hover:border-emerald-200 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm">{p.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {(p.users as unknown as { name: string } | null)?.name} ·{" "}
                      {format(new Date(p.created_at), "M.d")} · 조회 {p.view_count}
                    </p>
                  </div>
                  <MessageSquare className="ml-3 size-4 flex-shrink-0 text-zinc-300" />
                </Link>
              ))
            )}
          </div>
        )}

        {/* ── 클럽원 탭 ── */}
        {activeTab === "members" && (
          <div className="space-y-4">
            {/* 승인 대기 (관리자만) */}
            {isAdmin && pendingMembers.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-amber-700">
                  가입 신청 대기 ({pendingMembers.length}명)
                </h2>
                <div className="space-y-2">
                  {pendingMembers.map((m: any) => {
                    const u = m.users as unknown as { name: string; city: string } | null;
                    return (
                      <div
                        key={m.user_id}
                        className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium">{u?.name}</p>
                          <p className="text-xs text-zinc-500">{u?.city}</p>
                        </div>
                        <div className="flex gap-2">
                          <form action={approveMember.bind(null, m.user_id, clubId)}>
                            <button
                              type="submit"
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                            >
                              승인
                            </button>
                          </form>
                          <form action={rejectMember.bind(null, m.user_id, clubId)}>
                            <button
                              type="submit"
                              className="rounded-lg bg-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600"
                            >
                              거절
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 활성 회원 목록 */}
            <div>
              <h2 className="mb-2 text-sm font-semibold text-zinc-500">
                활동 중 ({members.length}명)
              </h2>
              <div className="space-y-2">
                {members.map((m: any) => {
                  const u = m.users as {
                    name: string;
                    city: string;
                    tennis_start_year: number;
                    tennis_start_month: number;
                  } | null;
                  if (!u) return null;
                  const now = new Date();
                  const months =
                    (now.getFullYear() - u.tennis_start_year) * 12 +
                    (now.getMonth() + 1 - u.tennis_start_month);
                  const career = `${Math.max(0, Math.floor(months / 12))}년 ${Math.max(0, months % 12)}개월`;

                  return (
                    <div
                      key={m.user_id}
                      className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-white px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">
                          {u.name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-zinc-500">
                            {u.city} · 구력 {career}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(m.role === "owner" || m.role === "admin") && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            {m.role === "owner" ? "클럽장" : "임원"}
                          </span>
                        )}
                        {isAdmin && m.user_id !== user.id && (
                          <form action={removeMember.bind(null, m.user_id, clubId)}>
                            <button
                              type="submit"
                              className="text-xs text-zinc-300 hover:text-zinc-500"
                            >
                              내보내기
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
