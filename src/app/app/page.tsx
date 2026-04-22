import { redirect } from "next/navigation";
import Link from "next/link";

import { logout } from "@/app/auth/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

type Profile = {
  name: string;
  city: string;
  tennis_start_year: number;
  tennis_start_month: number;
};

function getTennisCareer(profile?: Profile | null) {
  if (!profile) {
    return "프로필 미완성";
  }

  const now = new Date();
  const months =
    (now.getFullYear() - profile.tennis_start_year) * 12 +
    (now.getMonth() + 1 - profile.tennis_start_month);
  const years = Math.max(0, Math.floor(months / 12));
  const restMonths = Math.max(0, months % 12);

  return `구력 ${years}년 ${restMonths}개월`;
}

export default async function AppHomePage() {
  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f3] px-5">
        <Card className="max-w-lg rounded-lg shadow-none">
          <CardHeader>
            <CardTitle>Supabase 설정 필요</CardTitle>
            <CardDescription>
              `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`과
              `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 설정하면 로그인 후 앱 홈을 사용할 수 있습니다.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase
      .from("users")
      .select("name, city, tennis_start_year, tennis_start_month")
      .eq("id", user.id)
      .maybeSingle<Profile>(),
    supabase
      .from("club_members")
      .select("role, status, clubs(id, name, type, city)")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: false, nullsFirst: false }),
  ]);

  return (
    <main className="min-h-screen bg-[#f7f7f3] px-5 py-6 text-zinc-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{profile?.name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold">{profile?.name ?? user.email}</h1>
              <p className="text-sm text-zinc-600">
                {profile?.city ?? "활동 지역 미입력"} · {getTennisCareer(profile)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              className={buttonVariants({
                className: "rounded-md",
                variant: "outline",
              })}
              href="/app/clubs"
            >
              클럽 찾기
            </Link>
            <form action={logout}>
              <Button className="rounded-md" type="submit" variant="outline">
                로그아웃
              </Button>
            </form>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-lg bg-white shadow-none md:col-span-2">
            <CardHeader>
              <CardTitle>내 클럽</CardTitle>
              <CardDescription>
                가입 승인 상태와 클럽 역할을 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {memberships?.length ? (
                memberships.map((membership) => {
                  const club = Array.isArray(membership.clubs)
                    ? membership.clubs[0]
                    : membership.clubs;

                  return (
                    <div
                      className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 p-3"
                      key={`${club?.id ?? "club"}-${membership.role}`}
                    >
                      <div>
                        <p className="font-medium">{club?.name ?? "클럽 정보 없음"}</p>
                        <p className="text-sm text-zinc-600">
                          {club?.city ?? "-"} · {membership.role}
                        </p>
                      </div>
                      <Badge
                        className="rounded-md"
                        variant={membership.status === "active" ? "default" : "secondary"}
                      >
                        {membership.status === "active" ? "활성" : "승인대기"}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-600">
                  아직 소속 클럽이 없습니다. 다음 단계에서 클럽 가입 신청 흐름을 연결합니다.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg bg-white shadow-none">
            <CardHeader>
              <CardTitle>다음 구현</CardTitle>
              <CardDescription>클럽 가입과 정기모임 투표</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-600">
              <p>1. 클럽 목록 조회</p>
              <p>2. 가입 신청 생성</p>
              <p>3. 모임/투표 데이터 연동</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
