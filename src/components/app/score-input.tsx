"use client";

import { updateMatchScore } from "@/app/app/actions";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

export function ScoreInput({
  matchId,
  clubId,
  meetingId,
  initialA,
  initialB,
}: {
  matchId: string;
  clubId: string;
  meetingId: string;
  initialA: number | null;
  initialB: number | null;
}) {
  const [scoreA, setScoreA] = useState(initialA?.toString() ?? "");
  const [scoreB, setScoreB] = useState(initialB?.toString() ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const a = parseInt(scoreA);
    const b = parseInt(scoreB);
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0) return;

    startTransition(() => {
      updateMatchScore(matchId, clubId, meetingId, a, b);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        max={99}
        value={scoreA}
        onChange={(e) => setScoreA(e.target.value)}
        className="w-12 rounded-lg border border-zinc-200 bg-white py-1.5 text-center text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
      />
      <span className="text-sm text-zinc-400">:</span>
      <input
        type="number"
        min={0}
        max={99}
        value={scoreB}
        onChange={(e) => setScoreB(e.target.value)}
        className="w-12 rounded-lg border border-zinc-200 bg-white py-1.5 text-center text-sm font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-emerald-300"
      />
      <button
        onClick={handleSave}
        disabled={isPending}
        className={cn(
          "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
          saved
            ? "bg-emerald-100 text-emerald-700"
            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200",
        )}
      >
        {saved ? "저장됨" : "저장"}
      </button>
    </div>
  );
}
