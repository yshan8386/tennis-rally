"use client";

import { cn } from "@/lib/utils";
import { useTransition } from "react";
import { castVote } from "@/app/app/actions";

type VoteStatus = "attend" | "absent" | "undecided";

const buttons: { status: VoteStatus; label: string; active: string }[] = [
  { status: "attend", label: "참석", active: "bg-emerald-600 text-white border-emerald-600" },
  { status: "undecided", label: "미정", active: "bg-amber-500 text-white border-amber-500" },
  { status: "absent", label: "불참", active: "bg-rose-500 text-white border-rose-500" },
];

export function VoteButtons({
  meetingId,
  clubId,
  currentVote,
}: {
  meetingId: string;
  clubId: string;
  currentVote: VoteStatus | null;
}) {
  const [isPending, startTransition] = useTransition();

  const handleVote = (status: VoteStatus) => {
    startTransition(() => {
      castVote(meetingId, clubId, status);
    });
  };

  return (
    <div className="flex gap-2">
      {buttons.map(({ status, label, active }) => (
        <button
          key={status}
          disabled={isPending}
          onClick={() => handleVote(status)}
          className={cn(
            "flex-1 rounded-xl border py-3 text-sm font-semibold transition-all disabled:opacity-60",
            currentVote === status
              ? active
              : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
