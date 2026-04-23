import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import { ScoreInput } from "@/components/app/score-input";

type UserInfo = { name: string } | null;

export default async function BracketPage({
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
      .select("id, meeting_date, location, status")
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

  const { data: matches } = await supabase
    .from("meeting_matches")
    .select(
      `id, round_no, court_no, display_order,
       score_a, score_b,
       team_a_p1_user:team_a_p1(name),
       team_a_p2_user:team_a_p2(name),
       team_b_p1_user:team_b_p1(name),
       team_b_p2_user:team_b_p2(name)`,
    )
    .eq("meeting_id", meetingId)
    .order("round_no")
    .order("display_order");

  if (!matches || matches.length === 0) {
    return (
      <main className="min-h-screen bg-[#f6fbf4] pb-24">
        <header className="flex items-center gap-3 border-b border-zinc-100 bg-white px-4 py-3">
          <Link href={`/app/club/${clubId}/meeting/${meetingId}`} className="text-zinc-400">
            <ArrowLeft className="size-5" />
          </Link>
          <p className="font-bold">대진표</p>
        </header>
        <div className="flex flex-col items-center justify-center pt-20 text-center">
          <p className="text-zinc-500">아직 대진표가 생성되지 않았습니다.</p>
          {isAdmin && (
            <Link
              href={`/app/club/${clubId}/meeting/${meetingId}`}
              className="mt-4 text-sm font-semibold text-emerald-600"
            >
              ← 모임 페이지에서 생성하기
            </Link>
          )}
        </div>
      </main>
    );
  }

  // 라운드별 그룹핑
  const rounds = Array.from(new Set(matches.map((m) => m.round_no))).sort((a, b) => a - b);
  const byRound = new Map<number, typeof matches>();
  for (const r of rounds) {
    byRound.set(r, matches.filter((m) => m.round_no === r));
  }

  const getName = (u: unknown) => (u as UserInfo)?.name ?? "?";

  // 전체 승/패 집계
  const stats = new Map<string, { win: number; lose: number; played: number }>();
  for (const m of matches) {
    if (m.score_a == null || m.score_b == null) continue;
    const ap1 = (m.team_a_p1_user as unknown as UserInfo)?.name ?? m.id;
    const ap2 = (m.team_a_p2_user as unknown as UserInfo)?.name ?? m.id;
    const bp1 = (m.team_b_p1_user as unknown as UserInfo)?.name ?? m.id;
    const bp2 = (m.team_b_p2_user as unknown as UserInfo)?.name ?? m.id;
    const teamA = [ap1, ap2];
    const teamB = [bp1, bp2];
    const aWin = m.score_a > m.score_b;

    for (const p of [...teamA, ...teamB]) {
      if (!stats.has(p)) stats.set(p, { win: 0, lose: 0, played: 0 });
    }
    for (const p of teamA) {
      const s = stats.get(p)!;
      s.played++;
      if (aWin) s.win++; else s.lose++;
    }
    for (const p of teamB) {
      const s = stats.get(p)!;
      s.played++;
      if (!aWin) s.win++; else s.lose++;
    }
  }

  return (
    <main className="min-h-screen bg-[#f6fbf4] pb-24">
      <header className="flex items-center gap-3 border-b border-zinc-100 bg-white px-4 py-3">
        <Link href={`/app/club/${clubId}/meeting/${meetingId}`} className="text-zinc-400">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <p className="font-bold">
            {format(new Date(meeting.meeting_date), "M월 d일", { locale: ko })} 대진표
          </p>
          <p className="text-xs text-zinc-500">{meeting.location}</p>
        </div>
      </header>

      <div className="space-y-5 px-4 py-4">
        {/* 라운드별 대진표 */}
        {rounds.map((roundNo) => (
          <section key={roundNo}>
            <h2 className="mb-2 font-semibold text-zinc-700">
              Round {roundNo}
            </h2>
            <div className="space-y-2">
              {byRound.get(roundNo)!.map((m: any) => {
                const ap1 = getName(m.team_a_p1_user);
                const ap2 = getName(m.team_a_p2_user);
                const bp1 = getName(m.team_b_p1_user);
                const bp2 = getName(m.team_b_p2_user);
                const hasScore = m.score_a != null && m.score_b != null;
                const aWon = hasScore && m.score_a > m.score_b;
                const bWon = hasScore && m.score_b > m.score_a;

                return (
                  <div
                    key={m.id}
                    className="rounded-2xl border border-zinc-100 bg-white p-3"
                  >
                    <p className="mb-2 text-[11px] font-semibold text-zinc-400">
                      {m.court_no ? `${m.court_no}코트` : ""}
                    </p>
                    <div className="flex items-center gap-2">
                      {/* 팀 A */}
                      <div className={`flex-1 ${aWon ? "opacity-100" : hasScore ? "opacity-50" : ""}`}>
                        <p className={`text-sm font-bold ${aWon ? "text-emerald-700" : "text-zinc-700"}`}>
                          {ap1}
                        </p>
                        <p className={`text-sm font-bold ${aWon ? "text-emerald-700" : "text-zinc-700"}`}>
                          {ap2}
                        </p>
                      </div>

                      {/* 스코어 */}
                      <div className="flex flex-col items-center gap-1">
                        {isAdmin ? (
                          <ScoreInput
                            matchId={m.id}
                            clubId={clubId}
                            meetingId={meetingId}
                            initialA={m.score_a}
                            initialB={m.score_b}
                          />
                        ) : hasScore ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${aWon ? "text-emerald-600" : "text-zinc-400"}`}>
                              {m.score_a}
                            </span>
                            <span className="text-xs text-zinc-300">:</span>
                            <span className={`text-lg font-bold ${bWon ? "text-emerald-600" : "text-zinc-400"}`}>
                              {m.score_b}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-zinc-300">vs</span>
                        )}
                      </div>

                      {/* 팀 B */}
                      <div className={`flex-1 text-right ${bWon ? "opacity-100" : hasScore ? "opacity-50" : ""}`}>
                        <p className={`text-sm font-bold ${bWon ? "text-emerald-700" : "text-zinc-700"}`}>
                          {bp1}
                        </p>
                        <p className={`text-sm font-bold ${bWon ? "text-emerald-700" : "text-zinc-700"}`}>
                          {bp2}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* 전적 집계 (스코어 입력된 경우) */}
        {stats.size > 0 && (
          <section>
            <h2 className="mb-2 font-semibold text-zinc-700">전적</h2>
            <div className="rounded-2xl border border-zinc-100 bg-white divide-y divide-zinc-100">
              {[...stats.entries()]
                .sort((a, b) => b[1].win - a[1].win)
                .map(([name, s]) => (
                  <div key={name} className="flex items-center justify-between px-4 py-2.5">
                    <p className="font-medium text-sm">{name}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-emerald-600 font-semibold">{s.win}승</span>
                      <span className="text-zinc-400">{s.lose}패</span>
                      <span className="text-zinc-300">({s.played}경기)</span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
