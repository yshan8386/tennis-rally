"use client";

import { useActionState } from "react";
import { createPost, type PostFormState } from "@/app/app/actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { use } from "react";

const initial: PostFormState = {};

export default function NewPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: clubId } = use(params);
  const [state, action, pending] = useActionState(createPost, initial);

  return (
    <main className="min-h-screen bg-[#f6fbf4] pb-24">
      <header className="flex items-center gap-3 border-b border-zinc-100 bg-white px-4 py-3">
        <Link href={`/app/club/${clubId}?tab=board`} className="text-zinc-400">
          <ArrowLeft className="size-5" />
        </Link>
        <p className="font-bold">글쓰기</p>
      </header>

      <form action={action} className="space-y-4 px-4 py-4">
        <input type="hidden" name="club_id" value={clubId} />

        {state.message && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{state.message}</p>
        )}

        <div>
          <input
            name="title"
            placeholder="제목"
            required
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>

        <div>
          <textarea
            name="content"
            placeholder="내용을 입력하세요..."
            required
            rows={12}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className={cn(
            buttonVariants({ className: "w-full rounded-xl h-12 bg-emerald-600 text-white hover:bg-emerald-700" }),
            pending && "opacity-60",
          )}
        >
          {pending ? "등록 중..." : "게시글 등록"}
        </button>
      </form>
    </main>
  );
}
