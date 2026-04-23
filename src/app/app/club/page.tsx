export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export default async function MyClubsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("club_members")
    .select("club_id, role, status, joined_at, clubs(id, name, type, city, description)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false, nullsFirst: false });

  const active = memberships?.filter((m) => m.status === "active") ?? [];
  const pending = memberships?.filter((m) => m.status === "pending") ?? [];

  return (
    <main className="min-h-screen bg-[#f6fbf4] pb-24">
      <header className="px-4 pb-2 pt-5">
        <h1 className="text-2xl font-bold">클럽</h1>
        <p className="mt-0.5 text-sm text-zinc-500">내가 소속된 클럽을 관리합니다.</p>
      </header>

      <div className="space-y-5 px-4 pt-2">
        {/* 활성 클럽 목록 */}
        {active.length > 0 ? (
          <section className="space-y-2">
            {active.map((m) => {
              const club = m.clubs as unknown as { id: string; name: string; type: string; city: string; description: string | null } | null;
              if (!club) return null;
              return (
                <Link
                  key={m.club_id}
                  href={`/app/club/${m.club_id}`}
                  className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-white px-4 py-4 shadow-sm hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-base font-bold text-emerald-700">
                      {club.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{club.name}</p>
                      <p className="text-xs text-zinc-500">
                        {club.city} · {club.type === "club" ? "클럽" : "학원"} ·{" "}
                        <span className="font-medium text-emerald-700">
                          {m.role === "owner" ? "클럽장" : m.role === "admin" ? "임원" : "회원"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-zinc-300" />
                </Link>
              );
            })}
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-center">
            <p className="text-sm text-zinc-500">아직 소속된 클럽이 없습니다.</p>
          </div>
        )}

        {/* 승인 대기 */}
        {pending.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold text-zinc-500">가입 신청 대기 중</h2>
            <div className="space-y-2">
              {pending.map((m) => {
                const club = m.clubs as unknown as { id: string; name: string; type: string; city: string } | null;
                if (!club) return null;
                return (
                  <div
                    key={m.club_id}
                    className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-white px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{club.name}</p>
                      <p className="text-xs text-zinc-500">{club.city}</p>
                    </div>
                    <Badge className="rounded-full border-none bg-amber-100 text-amber-700">
                      승인 대기
                    </Badge>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 클럽 찾기 */}
        <Link
          href="/app/clubs"
          className={buttonVariants({
            variant: "outline",
            className: "w-full rounded-2xl h-12 gap-2 border-dashed border-zinc-300",
          })}
        >
          <Plus className="size-4" />
          클럽 찾기 · 새 클럽 만들기
        </Link>
      </div>
    </main>
  );
}
