import {
  Bell,
  CalendarDays,
  ChevronRight,
  Home,
  MapPin,
  MessageSquareText,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

const voteStats = [
  { label: "참석", value: 8, className: "bg-emerald-500", textClassName: "text-emerald-700" },
  { label: "미정", value: 3, className: "bg-amber-400", textClassName: "text-amber-700" },
  { label: "불참", value: 1, className: "bg-rose-400", textClassName: "text-rose-600" },
];

const quickActions = [
  { title: "투표하기", description: "5월 정기모임", icon: CalendarDays },
  { title: "대진표", description: "투표 마감 후 생성", icon: Trophy },
  { title: "클럽원", description: "32명 활동 중", icon: Users },
  { title: "게시판", description: "새 글 3개", icon: MessageSquareText },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6fbf4] text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-5">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-11 border border-emerald-100 bg-white">
              <AvatarFallback className="bg-emerald-50 text-emerald-700">
                김
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-zinc-500">안녕하세요, 김한한님</p>
              <h1 className="font-heading text-2xl">오늘도 즐테니스!</h1>
            </div>
          </div>
          <Link
            aria-label="로그인"
            className={buttonVariants({
              className: "size-10 rounded-full bg-white p-0 text-zinc-700",
              variant: "outline",
            })}
            href="/login"
          >
            <Bell className="size-4" />
          </Link>
        </header>

        <section className="mt-5 rounded-[1.4rem] border border-emerald-100 bg-white p-4 shadow-sm shadow-emerald-100/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-emerald-700">
                한빛 테니스 클럽
              </p>
              <h2 className="mt-1 font-heading text-3xl">5월 정기모임</h2>
            </div>
            <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
              투표중
            </Badge>
          </div>

          <div className="mt-5 space-y-2 text-sm text-zinc-600">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-emerald-600" />
              <span>2025.05.15 목요일 · 저녁 7시</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-emerald-600" />
              <span>양천구민체육관 2번 코트</span>
            </div>
          </div>

          <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-zinc-100">
            {voteStats.map((stat) => (
              <div
                className={stat.className}
                key={stat.label}
                style={{ flex: stat.value }}
              />
            ))}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {voteStats.map((stat) => (
              <div className="rounded-xl bg-zinc-50 px-3 py-2 text-center" key={stat.label}>
                <p className={`text-lg font-bold ${stat.textClassName}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <Link
              className={buttonVariants({
                className: "h-11 rounded-xl bg-emerald-600 text-white",
              })}
              href="/login"
            >
              참석
            </Link>
            <Link
              className={buttonVariants({
                className: "h-11 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
                variant: "secondary",
              })}
              href="/login"
            >
              미정
            </Link>
            <Link
              className={buttonVariants({
                className: "h-11 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
                variant: "secondary",
              })}
              href="/login"
            >
              불참
            </Link>
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-2xl">바로가기</h2>
            <Link className="text-sm font-medium text-emerald-700" href="/signup">
              시작하기
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm shadow-emerald-100/40 transition hover:border-emerald-200"
                  href="/login"
                  key={action.title}
                >
                  <div className="mb-4 flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon className="size-4" />
                  </div>
                  <p className="font-semibold">{action.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-5 space-y-3 pb-24">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl">새 소식</h2>
            <ChevronRight className="size-5 text-zinc-400" />
          </div>

          <article className="rounded-2xl border border-sky-100 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-sky-700">ATP/WTA</p>
                <h3 className="mt-1 font-semibold">Sinner vs Alcaraz</h3>
                <p className="mt-1 text-sm text-zinc-500">Roland Garros SF</p>
              </div>
              <Badge className="rounded-full bg-rose-100 text-rose-600">
                진행중
              </Badge>
            </div>
            <p className="mt-3 text-lg font-bold text-sky-700">6-4 · 4-6 · 3-2</p>
          </article>

          <article className="rounded-2xl border border-amber-100 bg-white p-4">
            <p className="text-xs font-semibold text-amber-700">클럽 공지</p>
            <h3 className="mt-1 font-semibold">5월 정기모임 일정 안내</h3>
            <p className="mt-1 text-sm text-zinc-500">2시간 전 · 관리자</p>
          </article>
        </section>

        <nav className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-emerald-100 bg-white/95 px-6 py-3 backdrop-blur">
          <div className="grid grid-cols-4 text-center text-xs font-medium text-zinc-500">
            <Link className="flex flex-col items-center gap-1 text-emerald-700" href="/">
              <Home className="size-5" />
              홈
            </Link>
            <Link className="flex flex-col items-center gap-1" href="/login">
              <Trophy className="size-5" />
              경기
            </Link>
            <Link className="flex flex-col items-center gap-1" href="/login">
              <Users className="size-5" />
              클럽
            </Link>
            <Link className="flex flex-col items-center gap-1" href="/login">
              <UserRound className="size-5" />
              마이
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}
