import Link from "next/link";
import { redirect } from "next/navigation";

import { requestClubMembership } from "@/app/app/actions";
import { CreateClubForm } from "@/components/app/create-club-form";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

type Club = {
  id: string;
  name: string;
  type: "club" | "academy";
  city: string;
  description: string | null;
};

export default async function ClubsPage() {
  if (!isSupabaseConfigured) {
    redirect("/app");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: clubs }, { data: memberships }] = await Promise.all([
    supabase.from("clubs").select("id, name, type, city, description").order("name"),
    supabase
      .from("club_members")
      .select("club_id, role, status")
      .eq("user_id", user.id),
  ]);

  const membershipByClub = new Map(
    memberships?.map((membership) => [membership.club_id, membership]) ?? [],
  );

  return (
    <main className="min-h-screen bg-[#f7f7f3] px-5 py-6 text-zinc-950">
      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[1fr_380px]">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">클럽 찾기</h1>
              <p className="text-sm text-zinc-600">
                기존 클럽에 가입 신청하거나 새 클럽을 만들 수 있습니다.
              </p>
            </div>
            <Link
              className={buttonVariants({
                className: "rounded-md",
                variant: "outline",
              })}
              href="/app"
            >
              홈
            </Link>
          </div>

          <div className="grid gap-3">
            {(clubs as Club[] | null)?.length ? (
              (clubs as Club[]).map((club) => {
                const membership = membershipByClub.get(club.id);
                const isActive = membership?.status === "active";
                const isPending = membership?.status === "pending";

                return (
                  <Card className="rounded-lg bg-white shadow-none" key={club.id}>
                    <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                      <div>
                        <CardTitle>{club.name}</CardTitle>
                        <CardDescription>
                          {club.city} · {club.type === "club" ? "클럽" : "학원"}
                        </CardDescription>
                      </div>
                      {membership ? (
                        <Badge
                          className="rounded-md"
                          variant={isActive ? "default" : "secondary"}
                        >
                          {isActive ? "활성" : "승인대기"}
                        </Badge>
                      ) : null}
                    </CardHeader>
                    <CardContent className="flex items-end justify-between gap-4">
                      <p className="text-sm text-zinc-600">
                        {club.description || "클럽 소개가 아직 없습니다."}
                      </p>
                      {!membership ? (
                        <form action={requestClubMembership}>
                          <input name="club_id" type="hidden" value={club.id} />
                          <Button className="rounded-md" type="submit">
                            가입 신청
                          </Button>
                        </form>
                      ) : (
                        <Button className="rounded-md" disabled variant="outline">
                          {isPending ? "승인 대기중" : "가입됨"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="rounded-lg bg-white shadow-none">
                <CardHeader>
                  <CardTitle>등록된 클럽이 없습니다</CardTitle>
                  <CardDescription>오른쪽 폼에서 첫 클럽을 만들어 주세요.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </section>

        <aside>
          <Card className="rounded-lg bg-white shadow-none">
            <CardHeader>
              <CardTitle>새 클럽 만들기</CardTitle>
              <CardDescription>
                만든 사용자는 자동으로 owner 멤버십을 받습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateClubForm />
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
