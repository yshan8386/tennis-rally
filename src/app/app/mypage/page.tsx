export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronRight, LogOut, Settings, Trophy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { logout } from "@/app/auth/actions";

function getTennisCareer(year: number, month: number) {
  const now = new Date();
  const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
  const y = Math.max(0, Math.floor(months / 12));
  const m = Math.max(0, months % 12);
  return `${y}년 ${m}개월`;
}

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: memberships }, { data: awards }] =
    await Promise.all([
      supabase
        .from("users")
        .select(
          "name, city, gender, birth_year, phone, tennis_start_year, tennis_start_month, created_at",
        )
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("club_members")
        .select("club_id, role, status, joined_at, clubs(id, name, type, city)")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false, nullsFirst: false }),
      supabase
        .from("awards")
        .select("id, award_type, awarded_at, clubs(name), tournaments(name)")
        .eq("user_id", user.id)
        .order("awarded_at", { ascending: false })
        .limit(10),
    ]);

  const career = profile
    ? getTennisCareer(profile.tennis_start_year, profile.tennis_start_month)
    : null;

  const active = memberships?.filter((m) => m.status === "active") ?? [];
  const pending = memberships?.filter((m) => m.status === "pending") ?? [];

  return (
    <main className="min-h-screen bg-[#f6fbf4] pb-24">
      {/* 헤더 */}
      <header className="flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3">
        <p className="font-bold">마이페이지</p>
        <Link href="/app/mypage/settings" className="text-zinc-400">
          <Settings className="size-5" />
        </Link>
      </header>

      <div className="space-y-4 px-4 py-4">
        {/* 프로필 카드 */}
        <section className="rounded-2xl border border-zinc-100 bg-white p-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border border-emerald-100">
              <AvatarFallback className="bg-emerald-50 text-2xl font-bold text-emerald-700">
                {profile?.name?.[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-bold">{profile?.name ?? user.email}</p>
              <p className="text-sm text-zinc-500">{profile?.city}</p>
              {career && (
                <p className="mt-0.5 text-xs text-zinc-400">
                  테니스 시작:{" "}
                  {profile?.tennis_start_year}년 {profile?.tennis_start_month}월 · 구력{" "}
                  <span className="font-semibold text-emerald-700">{career}</span>
                </p>
              )}
            </div>
          </div>

          {profile && (
            <div className="mt-4 grid grid-cols-3 divide-x divide-zinc-100 rounded-xl bg-zinc-50 py-2 text-center">
              <div>
                <p className="text-base font-bold text-emerald-700">{active.length}</p>
                <p className="text-xs text-zinc-500">소속 클럽</p>
              </div>
              <div>
                <p className="text-base font-bold text-emerald-700">{awards?.length ?? 0}</p>
                <p className="text-xs text-zinc-500">수상 경력</p>
              </div>
              <div>
                <p className="text-base font-bold text-emerald-700">
                  {profile.gender === "M" ? "남" : "여"}
                </p>
                <p className="text-xs text-zinc-500">성별</p>
              </div>
            </div>
          )}

          <Link
            href="/app/mypage/edit"
            className="mt-3 block text-center text-sm font-semibold text-emerald-600"
          >
            프로필 수정 →
          </Link>
        </section>

        {/* 소속 클럽 */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">소속 클럽</h2>
            <Link href="/app/clubs" className="text-xs text-zinc-400">
              클럽 찾기
            </Link>
          </div>

          {active.length > 0 ? (
            <div className="space-y-2">
              {active.map((m) => {
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
                        {club.city} · {club.type === "club" ? "클럽" : "학원"} ·{" "}
                        <span className="font-medium text-emerald-600">
                          {m.role === "owner" ? "클럽장" : m.role === "admin" ? "임원" : "회원"}
                        </span>
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-zinc-300" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-4 text-center text-sm text-zinc-400">
              소속 클럽이 없습니다.
            </div>
          )}

          {pending.length > 0 && (
            <div className="mt-2 space-y-2">
              {pending.map((m) => {
                const club = m.clubs as unknown as { id: string; name: string } | null;
                if (!club) return null;
                return (
                  <div
                    key={m.club_id}
                    className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-white px-4 py-3 opacity-60"
                  >
                    <p className="font-medium">{club.name}</p>
                    <Badge className="rounded-full border-none bg-amber-100 text-amber-700 text-xs">
                      승인 대기
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 수상 경력 */}
        {awards && awards.length > 0 && (
          <section>
            <h2 className="mb-2 font-semibold">수상 경력</h2>
            <div className="space-y-2">
              {awards.map((a) => {
                const club = a.clubs as unknown as { name: string } | null;
                const tournament = a.tournaments as unknown as { name: string } | null;
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white px-4 py-3"
                  >
                    <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-50">
                      <Trophy className="size-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{a.award_type}</p>
                      <p className="text-xs text-zinc-400">
                        {tournament?.name ?? club?.name} ·{" "}
                        {format(new Date(a.awarded_at), "yyyy.MM.dd")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 로그아웃 */}
        <section className="rounded-2xl border border-zinc-100 bg-white">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-rose-500"
            >
              <LogOut className="size-4" />
              로그아웃
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
