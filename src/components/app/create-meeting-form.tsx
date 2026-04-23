"use client";

import { useActionState, useState } from "react";
import { createMeeting, type MeetingFormState } from "@/app/app/actions";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initialState: MeetingFormState = {};

export function CreateMeetingForm({ clubId }: { clubId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createMeeting, initialState);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-700"
      >
        <span className="flex items-center gap-2">
          <Plus className="size-4 text-emerald-600" />새 모임 만들기
        </span>
        {open ? <ChevronUp className="size-4 text-zinc-400" /> : <ChevronDown className="size-4 text-zinc-400" />}
      </button>

      {open && (
        <form action={action} className="border-t border-zinc-100 px-4 pb-4 pt-3 space-y-3">
          <input type="hidden" name="club_id" value={clubId} />

          {state.message && (
            <p className={cn("rounded-xl px-3 py-2 text-sm", state.message.includes("실패") ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700")}>
              {state.message}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">날짜 *</label>
            <input
              name="meeting_date"
              type="date"
              required
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
            {state.errors?.meeting_date && (
              <p className="mt-1 text-xs text-red-500">{state.errors.meeting_date[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">시작 시간</label>
              <input
                name="starts_at"
                type="time"
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">투표 마감</label>
              <input
                name="vote_closes_at"
                type="datetime-local"
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">장소 *</label>
            <input
              name="location"
              type="text"
              required
              placeholder="양천구민체육관 2번 코트"
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">메모</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="준비물, 주의사항 등"
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className={cn(
              buttonVariants({ className: "w-full rounded-xl h-11 bg-emerald-600 text-white hover:bg-emerald-700" }),
              pending && "opacity-60",
            )}
          >
            {pending ? "생성 중..." : "모임 만들기"}
          </button>
        </form>
      )}
    </div>
  );
}
