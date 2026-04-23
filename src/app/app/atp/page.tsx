export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowLeft, Calendar, Globe, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MOCK_TOURNAMENTS = [
  {
    id: "1",
    name: "Roland Garros",
    category: "Grand Slam",
    location: "Paris, France",
    surface: "클레이",
    dates: "5.25 – 6.8",
    status: "ongoing",
    tour: "ATP",
  },
  {
    id: "2",
    name: "Halle Open",
    category: "ATP 500",
    location: "Halle, Germany",
    surface: "잔디",
    dates: "6.15 – 6.21",
    status: "upcoming",
    tour: "ATP",
  },
  {
    id: "3",
    name: "Queen's Club",
    category: "ATP 500",
    location: "London, UK",
    surface: "잔디",
    dates: "6.15 – 6.21",
    status: "upcoming",
    tour: "ATP",
  },
  {
    id: "4",
    name: "Wimbledon",
    category: "Grand Slam",
    location: "London, UK",
    surface: "잔디",
    dates: "6.30 – 7.13",
    status: "upcoming",
    tour: "ATP",
  },
  {
    id: "5",
    name: "Internazionali BNL d'Italia",
    category: "ATP 1000",
    location: "Rome, Italy",
    surface: "클레이",
    dates: "5.4 – 5.17",
    status: "completed",
    tour: "ATP",
  },
  {
    id: "6",
    name: "Roland Garros",
    category: "Grand Slam",
    location: "Paris, France",
    surface: "클레이",
    dates: "5.25 – 6.7",
    status: "ongoing",
    tour: "WTA",
  },
  {
    id: "7",
    name: "Berlin Open",
    category: "WTA 500",
    location: "Berlin, Germany",
    surface: "잔디",
    dates: "6.14 – 6.21",
    status: "upcoming",
    tour: "WTA",
  },
];

const SURFACE_COLORS: Record<string, string> = {
  클레이: "bg-orange-100 text-orange-700",
  잔디: "bg-green-100 text-green-700",
  하드: "bg-sky-100 text-sky-700",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  ongoing: { label: "진행중", className: "bg-rose-100 text-rose-600" },
  upcoming: { label: "예정", className: "bg-sky-100 text-sky-700" },
  completed: { label: "종료", className: "bg-zinc-100 text-zinc-500" },
};

export default function AtpPage({
  searchParams,
}: {
  searchParams: Promise<{ tour?: string }>;
}) {
  return <AtpPageContent />;
}

function AtpPageContent() {
  return (
    <main className="min-h-screen bg-[#f6fbf4] pb-24">
      <header className="border-b border-zinc-100 bg-white px-4 py-3">
        <h1 className="font-bold text-lg">ATP / WTA</h1>
        <p className="text-xs text-zinc-400 mt-0.5">투어 일정 및 결과</p>
      </header>

      {/* 준비 중 배너 */}
      <div className="mx-4 mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
        <p className="text-sm font-semibold text-amber-800">🔧 데이터 연동 준비 중</p>
        <p className="mt-0.5 text-xs text-amber-600">
          실시간 경기 결과 및 순위는 Phase 2에서 제공됩니다.
        </p>
      </div>

      {/* 탭 */}
      <TourFilter />
    </main>
  );
}

function TourFilter() {
  const tours = ["전체", "ATP", "WTA"];
  const activeTour = "전체";

  const filtered = MOCK_TOURNAMENTS;

  return (
    <>
      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        {tours.map((t) => (
          <span
            key={t}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              t === activeTour
                ? "bg-emerald-600 text-white"
                : "bg-white border border-zinc-200 text-zinc-500"
            }`}
          >
            {t}
          </span>
        ))}
        {["GS", "1000", "500", "250"].map((c) => (
          <span
            key={c}
            className="flex-shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-500"
          >
            {c}
          </span>
        ))}
      </div>

      <div className="space-y-2 px-4">
        {filtered.map((t) => {
          const status = STATUS_BADGE[t.status];
          const surfaceClass = SURFACE_COLORS[t.surface] ?? "bg-zinc-100 text-zinc-600";
          return (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-white px-4 py-3.5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{t.name}</p>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500">
                    {t.tour}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">{t.category}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {t.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {t.dates}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex flex-col items-end gap-1.5">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                  {status.label}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${surfaceClass}`}>
                  {t.surface}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
