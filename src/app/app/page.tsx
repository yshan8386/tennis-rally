import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, CalendarDays, ChevronRight, MapPin, Trophy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

function getTennisCareer(year: number, month: number) {
  const now = new Date();
  const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
  const y = Math.max(0, Math.floor(months / 12));
  const m = Math.max(0, months % 12);
  return `구력 ${y}년 ${m}개월`;
}

function VoteBar({ attend, undecided, absent }: { attend: number; undecided: number; absent: number }) {
  const total = attend + undecided + absent;
  if (total === 0) return null;
  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-zinc-100">
        <div className="bg-emerald-500 transition-all" style={{ width: `${(attend / total) * 100}%` }} />
        <div className="bg-amber-400 transition-all" style={{ width: `${(undecided / total) * 100}%` }} />
        <div className="bg-rose-400 transition-all" style={{ width: `${(absent / total) * 100}%` }} />
      </div>
      <div className="mt-1.5 flex gap-3 text-xs text-zinc-500">
        <span className="text-emerald-600 font-medium">참석 {attend}</span>
        <span className="text-amber-600">미정 {undecided}</span>
        <span className="text-rose-500">불참 {absent}</span>
      </div>
    </div>
  );
}

export default async function AppHomePage() {
  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <p className="text-sm text-zinc-500">Supabase 환경 변수를 설정해 주세요.</p>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase
      .from("users")
      .select("name, city, tennis_start_year, tennis_start_month")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("club_members")
      .select("club_id, role, status, clubs(id, name, type, city)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("joined_at", { ascending: true }),
  ]);

  const activeClubIds = memberships?.map((m) => m.club_id) ?? [];

  // 가장 가까운 투표 중인 모임
  const { data: upcomingMeeting } = activeClubIds.length
    ? await supabase
        .from("meetings")
        .select("id, club_id, meeting_date, starts_at, location, status, clubs(name)")
        .in("club_id", activeClubIds)
        .in("status", ["voting", "confirmed"])
        .order("meeting_date", { ascending: true })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const { data: meetingVotes } = upcomingMeeting
    ? await supabase
        .from("meeting_votes")
        .select("status")
        .eq("meeting_id", upcomingMeeting.id)
    : { data: null };

  const voteCounts = {
    attend: meetingVotes?.filter((v) => v.status === "attend").length ?? 0,
    undecided: meetingVotes?.filter((v) => v.status === "undecided").length ?? 0,
    absent: meetingVotes?.filter((v) => v.status === "absent").length ?? 0,
  };

  const myVote = upcomingMeeting
    ? await supabase
        .from("meeting_votes")
        .select("status")
        .eq("meeting_id", upcomingMeeting.id)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  // 최근 공지
  const { data: recentNotices } = activeClubIds.length
    ? await supabase
        .from("club_notices")
        .select("id, title, published_at, is_pinned, club_id, clubs(name)")
        .in("club_id", activeClubIds)
        .order("published_at", { ascending: false })
        .limit(3)
    : { data: null };

  const meetingClub = upcomingMeeting?.clubs as unknown as { name: string } | null;

  return (
    <main className="min-h-screen bg-[#f6fbf4] pb-24">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 pb-3 pt-5">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border border-emerald-100 bg-white">
            <AvatarFallback className="bg-emerald-50 text-emerald-700 font-semibold">
              {profile?.name?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-zinc-500">안녕하세요</p>
            <p className="font-semibold leading-tight">{profile?.name ?? user.email}</p>
          </div>
        </div>
        <Link
          aria-label="알림"
          href="/app/mypage"
          className={buttonVariants({
            variant: "outline",
            className: "size-9 rounded-full p-0 bg-white",
          })}
        >
          <Bell className="size-4 text-zinc-500" />
        </Link>
      </header>

      <div className="space-y-4 px-4">
        {/* 구력 배지 */}
        {profile && (
          <div className="flex gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {profile.city}
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
              {getTennisCareer(profile.tennis_start_year, profile.tennis_start_month)}
            </span>
          </div>
        )}

        {/* 현재 투표 중인 모임 카드 */}
        {upcomingMeeting ? (
          <section className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm shadow-emerald-50">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-emerald-700">
                  {meetingClub?.name ?? "클럽"}
                </p>
                <h2 className="mt-0.5 text-lg font-bold">
                  {format(new Date(upcomingMeeting.meeting_date), "M월 d일 (EEE)", { locale: ko })} 정기모임
                </h2>
              </div>
              <Badge
                className={
                  upcomingMeeting.status === "voting"
                    ? "rounded-full bg-rose-100 text-rose-600 border-none"
                    : "rounded-full bg-emerald-100 text-emerald-700 border-none"
                }
              >
                {upcomingMeeting.status === "voting" ? "투표중" : "확정"}
              </Badge>
            </div>

            <div className="mb-3 space-y-1.5 text-sm text-zinc-500">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-emerald-500" />
                <span>
                  {format(new Date(upcomingMeeting.meeting_date), "yyyy.MM.dd")}
                  {upcomingMeeting.starts_at && ` · ${upcomingMeeting.starts_at.slice(0, 5)}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-emerald-500" />
                <span>{upcomingMeeting.location}</span>
              </div>
            </div>

            <VoteBar {...voteCounts} />

            {upcomingMeeting.status === "voting" && (
              <div className="mt-3">
                {myVote.data ? (
                  <p className="mb-2 text-xs text-zinc-500">
                    내 투표:{" "}
                    <span className="font-semibold text-zinc-700">
                      {myVote.data.status === "attend" ? "✓ 참석" : myVote.data.status === "absent" ? "✗ 불참" : "? 미정"}
                    </span>
                    {" "}· 변경하려면 투표 페이지로 이동하세요
                  </p>
                ) : null}
                <Link
                  href={`/app/club/${upcomingMeeting.club_id}/meeting/${upcomingMeeting.id}`}
                  className={buttonVariants({
                    className: "w-full rounded-xl h-11 bg-emerald-600 text-white hover:bg-emerald-700",
                  })}
                >
                  {myVote.data ? "투표 현황 보기" : "투표하기"}
                </Link>
              </div>
            )}

            {upcomingMeeting.status === "confirmed" && (
              <Link
                href={`/app/club/${upcomingMeeting.club_id}/meeting/${upcomingMeeting.id}/bracket`}
                className={buttonVariants({
                  className: "mt-3 w-full rounded-xl h-11",
                  variant: "outline",
                })}
              >
                대진표 보기
              </Link>
            )}
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-zinc-200 bg-white p-5 text-center">
            <p className="text-sm text-zinc-500">예정된 정기모임이 없습니다.</p>
            {activeClubIds.length === 0 && (
              <Link
                href="/app/clubs"
                className={buttonVariants({ className: "mt-3 rounded-xl", variant: "outline" })}
              >
                클럽 찾기
              </Link>
            )}
          </section>
        )}

        {/* 내 클럽 */}
        {memberships && memberships.length > 0 && (
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">내 클럽</h3>
              <Link href="/app/club" className="text-xs text-zinc-400">
                전체보기 <ChevronRight className="inline size-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {memberships.map((m) => {
                const club = m.clubs as unknown as { id: string; name: string; type: string; city: string } | null;
                if (!club) return null;
                return (
                  <Link
                    key={m.club_id}
                    href={`/app/club/${m.club_id}`}
                    className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-white px-4 py-3 hover:border-emerald-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{club.name}</p>
                      <p className="text-xs text-zinc-500">
                        {club.city} · {club.type === "club" ? "클럽" : "학원"}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-emerald-600">
                      {m.role === "owner" ? "클럽장" : m.role === "admin" ? "임원" : "회원"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 최근 공지 */}
        {recentNotices && recentNotices.length > 0 && (
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">최근 공지</h3>
            </div>
            <div className="space-y-2">
              {recentNotices.map((notice) => {
                const club = notice.clubs as unknown as { name: string } | null;
                return (
                  <Link
                    key={notice.id}
                    href={`/app/club/${notice.club_id}?tab=notices`}
                    className="block rounded-2xl border border-zinc-100 bg-white px-4 py-3 hover:border-emerald-100 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      {notice.is_pinned && (
                        <span className="mt-0.5 flex-shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                          공지
                        </span>
                      )}
                      <p className="font-medium text-sm leading-snug">{notice.title}</p>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      {club?.name} · {format(new Date(notice.published_at), "M.d")}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ATP 카드 */}
        <section className="rounded-2xl border border-sky-100 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <Trophy className="size-4 text-sky-600" />
            <span className="text-xs font-semibold text-sky-700">ATP/WTA</span>
          </div>
          <Link href="/app/atp" className="block">
            <p className="font-semibold">Roland Garros 2025</p>
            <p className="mt-0.5 text-sm text-zinc-500">대회 일정 및 결과 보기</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
