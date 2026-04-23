import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft, CalendarDays, MapPin, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { VoteButtons } from "@/components/app/vote-buttons";
import { closeMeetingVote, generateBracket } from "@/app/app/actions";

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ id: string; meetingId: string }>;
}) {
  const { id: clubId, meetingId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: meeting }, { data: membership }] = await Promise.all([
    supabase
      .from("meetings")
      .select("id, club_id, meeting_date, starts_at, location, status, vote_closes_at, notes")
      .eq("id", meetingId)
      .single(),
    supabase
      .from("club_members")
      .select("role, status")
      .eq("club_id", clubId)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!meeting || !membership || membership.status !== "active") redirect(`/app/club/${clubId}`);

  const isAdmin = membership.role === "owner" || membership.role === "admin";
  const isVoting = meeting.status === "voting";
  const isConfirmed = meeting.status === "confirmed";

  const { data: votes } = await supabase
    .from("meeting_votes")
    .select("user_id, status, users(name)")
    .eq("meeting_id", meetingId);

  const myVote = votes?.find((v) => v.user_id === user.id) ?? null;

  const grouped = {
    attend: votes?.filter((v) => v.status === "attend") ?? [],
    undecided: votes?.filter((v) => v.status === "undecided") ?? [],
    absent: votes?.filter((v) => v.status === "absent") ?? [],
  };
  const total = (votes?.length ?? 0);

  // 대진표 존재 여부
  const { count: matchCount } = await supabase
    .from("meeting_matches")
    .select("*", { count: "exact", head: true })
    .eq("meeting_id", meetingId);

  return (
    <main className="min-h-screen bg-[#f6fbf4] pb-24">
      {/* 헤더 */}
      <header className="flex items-center gap-3 border-b border-zinc-100 bg-white px-4 py-3">
        <Link href={`/app/club/${clubId}`} className="text-zinc-400">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <p className="font-bold leading-tight">
            {format(new Date(meeting.meeting_date), "M월 d일 (EEE)", { locale: ko })} 정기모임
          </p>
          <p className="text-xs text-zinc-500">
            {isVoting ? "투표 진행 중" : isConfirmed ? "투표 마감" : meeting.status}
          </p>
        </div>
      </header>

      <div className="space-y-4 px-4 py-4">
        {/* 모임 정보 */}
        <section className="rounded-2xl border border-zinc-100 bg-white p-4">
          <div className="space-y-2 text-sm text-zinc-600">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-emerald-500" />
              <span>
                {format(new Date(meeting.meeting_date), "yyyy년 M월 d일 (EEE)", { locale: ko })}
                {meeting.starts_at && ` · ${meeting.starts_at.slice(0, 5)}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-emerald-500" />
              <span>{meeting.location}</span>
            </div>
            {meeting.vote_closes_at && (
              <p className="text-xs text-zinc-400">
                투표 마감: {format(new Date(meeting.vote_closes_at), "M.d HH:mm")}
              </p>
            )}
            {meeting.notes && (
              <p className="mt-1 text-xs text-zinc-400 whitespace-pre-line">{meeting.notes}</p>
            )}
          </div>
        </section>

        {/* 투표 현황 */}
        <section className="rounded-2xl border border-zinc-100 bg-white p-4">
          <h2 className="mb-3 font-semibold">투표 현황 ({total}명)</h2>
          {total > 0 ? (
            <>
              <div className="flex h-3 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${(grouped.attend.length / total) * 100}%` }}
                />
                <div
                  className="bg-amber-400 transition-all"
                  style={{ width: `${(grouped.undecided.length / total) * 100}%` }}
                />
                <div
                  className="bg-rose-400 transition-all"
                  style={{ width: `${(grouped.absent.length / total) * 100}%` }}
                />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-emerald-50 py-2">
                  <p className="text-xl font-bold text-emerald-600">{grouped.attend.length}</p>
                  <p className="text-xs text-zinc-500">참석</p>
                </div>
                <div className="rounded-xl bg-amber-50 py-2">
                  <p className="text-xl font-bold text-amber-500">{grouped.undecided.length}</p>
                  <p className="text-xs text-zinc-500">미정</p>
                </div>
                <div className="rounded-xl bg-rose-50 py-2">
                  <p className="text-xl font-bold text-rose-500">{grouped.absent.length}</p>
                  <p className="text-xs text-zinc-500">불참</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-400">아직 투표한 사람이 없습니다.</p>
          )}
        </section>

        {/* 내 투표 */}
        {isVoting && (
          <section className="rounded-2xl border border-zinc-100 bg-white p-4">
            <h2 className="mb-3 font-semibold">
              내 투표{" "}
              {myVote && (
                <span className="text-sm font-normal text-zinc-400">
                  (현재:{" "}
                  {myVote.status === "attend"
                    ? "참석"
                    : myVote.status === "absent"
                    ? "불참"
                    : "미정"}
                  )
                </span>
              )}
            </h2>
            <VoteButtons
              meetingId={meetingId}
              clubId={clubId}
              currentVote={myVote?.status as "attend" | "absent" | "undecided" | null}
            />
          </section>
        )}

        {/* 관리자 액션 */}
        {isAdmin && (
          <section className="rounded-2xl border border-zinc-100 bg-white p-4">
            <h2 className="mb-3 font-semibold text-zinc-700">관리자</h2>
            <div className="space-y-2">
              {isVoting && (
                <form action={closeMeetingVote.bind(null, meetingId, clubId)}>
                  <button
                    type="submit"
                    className="w-full rounded-xl border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    투표 마감하기
                  </button>
                </form>
              )}
              {(isConfirmed || (matchCount ?? 0) > 0) && (
                <form action={generateBracket.bind(null, meetingId, clubId)}>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                  >
                    {(matchCount ?? 0) > 0 ? "대진표 재생성 (KDK)" : "대진표 생성 (KDK)"}
                  </button>
                </form>
              )}
              {(matchCount ?? 0) > 0 && (
                <Link
                  href={`/app/club/${clubId}/meeting/${meetingId}/bracket`}
                  className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5"
                >
                  <span className="text-sm font-semibold text-emerald-700">대진표 보기</span>
                  <ChevronRight className="size-4 text-emerald-500" />
                </Link>
              )}
            </div>
          </section>
        )}

        {/* 비관리자용 대진표 링크 */}
        {!isAdmin && (matchCount ?? 0) > 0 && (
          <Link
            href={`/app/club/${clubId}/meeting/${meetingId}/bracket`}
            className={buttonVariants({
              className: "w-full rounded-xl h-11",
              variant: "outline",
            })}
          >
            대진표 보기
          </Link>
        )}

        {/* 참석자 목록 */}
        {grouped.attend.length > 0 && (
          <section className="rounded-2xl border border-zinc-100 bg-white p-4">
            <h2 className="mb-3 font-semibold">
              참석 확정 ({grouped.attend.length}명)
            </h2>
            <div className="flex flex-wrap gap-2">
              {grouped.attend.map((v: any) => (
                <div
                  key={v.user_id}
                  className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1"
                >
                  <div className="size-5 flex items-center justify-center rounded-full bg-emerald-200 text-[10px] font-bold text-emerald-700">
                    {(v.users as unknown as { name: string } | null)?.name?.[0] ?? "?"}
                  </div>
                  <span className="text-xs font-medium text-emerald-800">
                    {(v.users as unknown as { name: string } | null)?.name ?? "알 수 없음"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 미정/불참 요약 */}
        {(grouped.undecided.length > 0 || grouped.absent.length > 0) && (
          <section className="rounded-2xl border border-zinc-100 bg-white p-4">
            {grouped.undecided.length > 0 && (
              <>
                <h3 className="mb-2 text-sm font-semibold text-amber-600">
                  미정 ({grouped.undecided.length}명)
                </h3>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {grouped.undecided.map((v: any) => (
                    <span
                      key={v.user_id}
                      className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-700"
                    >
                      {(v.users as unknown as { name: string } | null)?.name}
                    </span>
                  ))}
                </div>
              </>
            )}
            {grouped.absent.length > 0 && (
              <>
                <h3 className="mb-2 text-sm font-semibold text-rose-500">
                  불참 ({grouped.absent.length}명)
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {grouped.absent.map((v: any) => (
                    <span
                      key={v.user_id}
                      className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs text-rose-600"
                    >
                      {(v.users as unknown as { name: string } | null)?.name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
