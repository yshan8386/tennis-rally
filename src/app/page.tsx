import {
  Bell,
  CalendarDays,
  ClipboardList,
  Medal,
  MessageSquareText,
  Trophy,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    <main className="min-h-screen bg-[#f7f7f3] text-zinc-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-5 lg:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Tennis Rally
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              클럽 운영 대시보드
            </h1>
          </div>
          <Button className="gap-2 rounded-md">
            <Bell className="size-4" />
            알림
          </Button>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-5">
            <Card className="rounded-lg border-zinc-200 shadow-none">
              <CardHeader className="gap-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">한빛 테니스 클럽</CardTitle>
                    <CardDescription>서울시 · 클럽 · 활성 회원 32명</CardDescription>
                  </div>
                  <Badge className="rounded-md bg-emerald-700 text-white">
                    투표중
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border border-zinc-200 bg-white p-3">
                    <p className="text-xs text-zinc-500">다가오는 모임</p>
                    <p className="mt-1 font-semibold">2025.05.15</p>
                    <p className="text-sm text-zinc-600">양천구민체육관</p>
                  </div>
                  <div className="rounded-md border border-zinc-200 bg-white p-3">
                    <p className="text-xs text-zinc-500">참석 현황</p>
                    <p className="mt-1 font-semibold">8명 참석</p>
                    <p className="text-sm text-zinc-600">총 12명 투표</p>
                  </div>
                  <div className="rounded-md border border-zinc-200 bg-white p-3">
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
              <TabsList className="grid w-full grid-cols-4 rounded-md">
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
                      className="rounded-lg border-zinc-200 bg-white shadow-none"
                      key={module.title}
                    >
                      <CardHeader className="flex-row items-start gap-3 space-y-0">
                        <div className="rounded-md bg-emerald-50 p-2 text-emerald-700">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{module.title}</CardTitle>
                          <CardDescription>{module.description}</CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </TabsContent>
              <TabsContent value="home" className="mt-4">
                <Card className="rounded-lg shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base">홈 화면 우선순위</CardTitle>
                    <CardDescription>
                      ATP/WTA 요약, 클럽 공지, 대회 배너, 출석 투표 바로가기
                    </CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>
              <TabsContent value="tour" className="mt-4 grid gap-3">
                {matchCards.map(([title, names, score, status]) => (
                  <Card className="rounded-lg shadow-none" key={title}>
                    <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                      <div>
                        <CardTitle className="text-base">{title}</CardTitle>
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
                <Card className="rounded-lg shadow-none">
                  <CardHeader className="flex-row items-center gap-3 space-y-0">
                    <Avatar>
                      <AvatarFallback>김</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">김한한</CardTitle>
                      <CardDescription>서울시 · 구력 6년 3개월</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <aside className="rounded-xl border border-zinc-200 bg-zinc-950 p-3 text-white shadow-sm">
            <div className="mx-auto max-w-sm overflow-hidden rounded-[2rem] border border-white/20 bg-zinc-950">
              <div className="flex items-center justify-between px-5 py-3 text-xs text-zinc-400">
                <span>9:41</span>
                <span>||| 100%</span>
              </div>
              <div className="bg-white text-zinc-950">
                <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
                  <div>
                    <p className="font-semibold">테니스 클럽앱</p>
                    <p className="text-xs text-zinc-500">한빛 테니스 클럽</p>
                  </div>
                  <Badge className="rounded-md bg-blue-700">N</Badge>
                </div>
                <div className="space-y-3 p-4">
                  <div className="rounded-md border-l-4 border-red-500 bg-red-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-zinc-600">
                        Roland Garros SF
                      </p>
                      <Badge className="rounded-md bg-red-100 text-red-700">
                        진행중
                      </Badge>
                    </div>
                    <p className="mt-2 font-semibold">Sinner vs Alcaraz</p>
                    <p className="text-sm text-zinc-600">6-4  4-6  3-2</p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase text-zinc-500">
                      내 클럽 공지
                    </p>
                    <div className="rounded-md border border-zinc-200 p-3">
                      <p className="font-medium">5월 정기모임 일정 안내</p>
                      <p className="text-sm text-zinc-500">2시간 전</p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase text-zinc-500">
                      정기모임 투표
                    </p>
                    <div className="rounded-md border border-zinc-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">5월 정기모임</p>
                        <CalendarDays className="size-4 text-zinc-500" />
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center gap-2">
                        <Users className="size-4 text-emerald-700" />
                        <p className="text-sm text-zinc-600">
                          참석 8 · 미정 3 · 불참 1
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
