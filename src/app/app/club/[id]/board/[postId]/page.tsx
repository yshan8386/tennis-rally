import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft, CornerDownRight } from "lucide-react";
import { createComment } from "@/app/app/actions";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string; postId: string }>;
}) {
  const { id: clubId, postId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: post }, { data: membership }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, title, content, created_at, view_count, users(name)")
      .eq("id", postId)
      .single(),
    supabase
      .from("club_members")
      .select("role, status")
      .eq("club_id", clubId)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!post || !membership || membership.status !== "active") redirect(`/app/club/${clubId}?tab=board`);

  // 조회수 증가
  await supabase.from("posts").update({ view_count: (post.view_count ?? 0) + 1 }).eq("id", postId);

  const { data: rawComments } = await supabase
    .from("comments")
    .select("id, content, created_at, parent_id, author_id, users(name)")
    .eq("post_id", postId)
    .order("created_at");

  const comments = rawComments ?? [];
  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = new Map<string, typeof comments>();
  for (const c of comments.filter((c) => c.parent_id)) {
    const list = replies.get(c.parent_id!) ?? [];
    list.push(c);
    replies.set(c.parent_id!, list);
  }

  const author = post.users as unknown as { name: string } | null;

  return (
    <main className="min-h-screen bg-[#f6fbf4] pb-32">
      <header className="flex items-center gap-3 border-b border-zinc-100 bg-white px-4 py-3">
        <Link href={`/app/club/${clubId}?tab=board`} className="text-zinc-400">
          <ArrowLeft className="size-5" />
        </Link>
        <p className="font-bold">게시판</p>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* 게시글 본문 */}
        <article className="rounded-2xl border border-zinc-100 bg-white p-4">
          <h1 className="text-lg font-bold leading-snug">{post.title}</h1>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-medium text-zinc-600">{author?.name}</span>
            <span>·</span>
            <span>{format(new Date(post.created_at), "yyyy.MM.dd HH:mm", { locale: ko })}</span>
            <span>·</span>
            <span>조회 {(post.view_count ?? 0) + 1}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-zinc-700 whitespace-pre-line">
            {post.content}
          </p>
        </article>

        {/* 댓글 */}
        <section className="rounded-2xl border border-zinc-100 bg-white p-4">
          <h2 className="mb-3 font-semibold">댓글 {comments.length}개</h2>
          {topLevel.length === 0 ? (
            <p className="text-sm text-zinc-400">첫 번째 댓글을 남겨보세요.</p>
          ) : (
            <div className="space-y-4">
              {topLevel.map((c) => {
                const cu = c.users as unknown as { name: string } | null;
                return (
                  <div key={c.id}>
                    <div className="flex gap-2.5">
                      <div className="mt-0.5 flex size-7 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">
                        {cu?.name?.[0] ?? "?"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold">{cu?.name}</span>
                          <span className="text-xs text-zinc-400">
                            {format(new Date(c.created_at), "M.d HH:mm")}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-zinc-700">{c.content}</p>
                      </div>
                    </div>

                    {/* 대댓글 */}
                    {replies.get(c.id)?.map((r) => {
                      const ru = r.users as unknown as { name: string } | null;
                      return (
                        <div key={r.id} className="ml-9 mt-2 flex gap-2">
                          <CornerDownRight className="mt-1 size-3 flex-shrink-0 text-zinc-300" />
                          <div className="flex-1 rounded-xl bg-zinc-50 px-3 py-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs font-semibold">{ru?.name}</span>
                              <span className="text-xs text-zinc-400">
                                {format(new Date(r.created_at), "M.d HH:mm")}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-zinc-600">{r.content}</p>
                          </div>
                        </div>
                      );
                    })}

                    {/* 대댓글 입력 */}
                    <form action={createComment} className="ml-9 mt-2 flex gap-2">
                      <input type="hidden" name="post_id" value={postId} />
                      <input type="hidden" name="club_id" value={clubId} />
                      <input type="hidden" name="parent_id" value={c.id} />
                      <input
                        name="content"
                        placeholder="답글 달기..."
                        className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600"
                      >
                        등록
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 댓글 입력창 (고정) */}
      <div className="fixed inset-x-0 bottom-16 z-40 mx-auto w-full max-w-md border-t border-zinc-100 bg-white px-4 py-3">
        <form action={createComment} className="flex gap-2">
          <input type="hidden" name="post_id" value={postId} />
          <input type="hidden" name="club_id" value={clubId} />
          <input
            name="content"
            placeholder="댓글을 입력하세요..."
            className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            등록
          </button>
        </form>
      </div>
    </main>
  );
}
