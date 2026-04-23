"use client";

import { cn } from "@/lib/utils";
import { Home, Trophy, Users, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/app",
    label: "홈",
    icon: Home,
    match: (p: string) => p === "/app",
  },
  {
    href: "/app/atp",
    label: "경기",
    icon: Trophy,
    match: (p: string) => p.startsWith("/app/atp"),
  },
  {
    href: "/app/club",
    label: "클럽",
    icon: Users,
    match: (p: string) => p.startsWith("/app/club") || p.startsWith("/app/clubs"),
  },
  {
    href: "/app/mypage",
    label: "마이",
    icon: UserRound,
    match: (p: string) => p.startsWith("/app/mypage"),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md border-t border-zinc-100 bg-white/95 backdrop-blur-sm safe-area-pb">
      <div className="grid grid-cols-4 px-2 pb-1 pt-2">
        {navItems.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors",
                active ? "text-emerald-600" : "text-zinc-400 hover:text-zinc-500",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
