import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  LogIn,
  MapPin,
  Medal,
  MessageSquareText,
  ShieldCheck,
  TrendingUp,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const meetingVotes = [
  { label: "참석", value: 8, className: "bg-emerald-600" },
  { label: "미정", value: 3, className: "bg-amber-500" },
  { label: "불참", value: 1, className: "bg-red-500" },
];

const clubModules = [
  {
    title: "정기모임 투표",
    description: "참석, 불참, 미정을 클럽 단위로 집계",
    icon: ClipboardList,
  },
  {
    title: "복식 대진표",
    description: "참석자 기반 라운드와 코트 자동 배정",
    icon: Trophy,
  },
  {
    title: "공지와 게시판",
    description: "공지, 자유게시판, 댓글과 대댓글",
    icon: MessageSquareText,
  },
  {
    title: "회원 이력",
    description: "다중 클럽, 수상 경력, 참가 기록",
    icon: Medal,
  },
];

const matchCards = [
  ["Roland Garros SF", "Sinner vs Alcaraz", "6-4  4-6  3-2", "진행중"],
  ["Wimbledon", "대회 시작 예정", "2025.06.30 - 07.13", "예정"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4fbf7] text-zinc-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase text-emerald-700">
              Tennis Rally
            </p>
            <h1 className="mt-1 font-heading text-3xl text-zinc-950">
              클럽 운영 대시보드
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              className={buttonVariants({
                className: "rounded-md",
                variant: "outline",
              })}
              href="/login"
            >
              <LogIn className="size-4" />
              로그인
            </Link>
            <Link
              className={buttonVariants({ className: "rounded-md" })}
              href="/signup"
            >
              회원가입
            </Link>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex flex-col gap-5">
            <Card className="rounded-lg border-emerald-100 bg-white shadow-none">
              <CardHeader className="gap-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="font-heading text-2xl">
                      한빛 테니스 클럽
                    </CardTitle>
                    <CardDescription>서울시 · 클럽 · 활성 회원 32명</CardDescription>
                  </div>
                  <Badge className="rounded-md bg-emerald-600 text-white">
                    투표중
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border border-emerald-100 bg-emerald-50/70 p-3">
                    <p className="text-xs text-zinc-500">다가오는 모임</p>
                    <p className="mt-1 font-semibold">2025.05.15</p>
                    <p className="text-sm text-zinc-600">양천구민체육관</p>
                  </div>
                  <div className="rounded-md border border-sky-100 bg-sky-50/80 p-3">
                    <p className="text-xs text-zinc-500">참석 현황</p>
                    <p className="mt-1 font-semibold">8명 참석</p>
                    <p className="text-sm text-zinc-600">총 12명 투표</p>
                  </div>
                  <div className="rounded-md border border-orange-100 bg-orange-50/70 p-3">
                    <p className="text-xs text-zinc-500">다음 작업</p>
                    <p className="mt-1 font-semibold">대진표 생성</p>
                    <p className="text-sm text-zinc-600">투표 마감 후 가능</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex h-2 overflow-hidden rounded-full bg-zinc-200">
                    {meetingVotes.map((vote) => (
                      <div
                        className={vote.className}
                        key={vote.label}
                        style={{ flex: vote.value }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-zinc-600">
                    {meetingVotes.map((vote) => (
                      <span key={vote.label}>
                        {vote.label} {vote.value}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="club" className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-md bg-white/80">
                <TabsTrigger value="home">홈</TabsTrigger>
                <TabsTrigger value="tour">ATP/WTA</TabsTrigger>
                <TabsTrigger value="club">클럽</TabsTrigger>
                <TabsTrigger value="my">마이</TabsTrigger>
              </TabsList>
              <TabsContent value="club" className="mt-4 grid gap-3 sm:grid-cols-2">
                {clubModules.map((module) => {
                  const Icon = module.icon;

                  return (
                    <Card
                      className="rounded-lg border-emerald-100 bg-white shadow-none"
                      key={module.title}
                    >
                      <CardHeader className="flex-row items-start gap-3 space-y-0">
                        <div className="rounded-md bg-emerald-50 p-2 text-emerald-700">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <CardTitle className="font-heading text-xl">
                            {module.title}
                          </CardTitle>
                          <CardDescription>{module.description}</CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </TabsContent>
              <TabsContent value="home" className="mt-4">
                <Card className="rounded-lg border-sky-100 bg-white shadow-none">
                  <CardHeader>
                    <CardTitle className="font-heading text-xl">
                      홈 화면 우선순위
                    </CardTitle>
                    <CardDescription>
                      ATP/WTA 요약, 클럽 공지, 대회 배너, 출석 투표 바로가기
                    </CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>
              <TabsContent value="tour" className="mt-4 grid gap-3">
                {matchCards.map(([title, names, score, status]) => (
                  <Card className="rounded-lg border-sky-100 bg-white shadow-none" key={title}>
                    <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                      <div>
                        <CardTitle className="text-base font-semibold">{title}</CardTitle>
                        <CardDescription>{names}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="rounded-md">
                        {status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="text-sm text-zinc-600">{score}</CardContent>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="my" className="mt-4">
                <Card className="rounded-lg border-emerald-100 bg-white shadow-none">
                  <CardHeader className="flex-row items-center gap-3 space-y-0">
                    <Avatar>
                      <AvatarFallback>김</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="font-heading text-xl">김한한</CardTitle>
                      <CardDescription>서울시 · 구력 6년 3개월</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-none">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-emerald-700">
                    오늘의 운영
                  </p>
                  <h2 className="mt-1 font-heading text-2xl">바로 처리할 일</h2>
                </div>
                <Badge className="rounded-md bg-sky-100 text-sky-700">
                  4개
                </Badge>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-md border border-emerald-100 bg-emerald-50/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                    <CalendarDays className="size-4" />
                    5월 정기모임
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="rounded-md bg-white px-2 py-2">
                      <p className="font-semibold text-emerald-700">8</p>
                      <p className="text-xs text-zinc-500">참석</p>
                    </div>
                    <div className="rounded-md bg-white px-2 py-2">
                      <p className="font-semibold text-amber-600">3</p>
                      <p className="text-xs text-zinc-500">미정</p>
                    </div>
                    <div className="rounded-md bg-white px-2 py-2">
                      <p className="font-semibold text-red-500">1</p>
                      <p className="text-xs text-zinc-500">불참</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-sky-100 bg-sky-50/80 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-white p-2 text-sky-700">
                      <TrendingUp className="size-4" />
                    </div>
                    <div>
                      <p className="font-semibold">ATP/WTA 라이브 요약</p>
                      <p className="mt-1 text-sm text-zinc-600">
                        Roland Garros SF · Sinner vs Alcaraz
                      </p>
                      <p className="mt-1 text-sm font-semibold text-sky-700">
                        6-4 · 4-6 · 3-2
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-orange-100 bg-orange-50/80 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-white p-2 text-orange-700">
                      <MapPin className="size-4" />
                    </div>
                    <div>
                      <p className="font-semibold">양천구민체육관</p>
                      <p className="mt-1 text-sm text-zinc-600">
                        2번 코트 · 2025.05.15 목요일
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-5">
              <h3 className="font-heading text-xl">진행 체크</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>공지 노출 완료</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock3 className="size-4 text-amber-600" />
                  <span>투표 마감 대기</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-4 text-sky-700" />
                  <span>관리자 권한 확인</span>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
