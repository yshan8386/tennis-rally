"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClubSchema, type ClubFormState } from "@/lib/club-schemas";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { generateKDKBracket } from "@/lib/bracket";

async function getAuthenticatedUser() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { supabase, user };
}

// ─── 클럽 ───────────────────────────────────────────────

export async function createClub(
  _state: ClubFormState,
  formData: FormData,
): Promise<ClubFormState> {
  const auth = await getAuthenticatedUser();
  if (!auth) return { message: "로그인이 필요합니다." };

  const validated = createClubSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    city: formData.get("city"),
    description: formData.get("description"),
  });

  if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

  const { error } = await auth.supabase.from("clubs").insert({
    ...validated.data,
    created_by: auth.user.id,
  });

  if (error) return { message: "클럽 생성에 실패했습니다." };

  revalidatePath("/app/club");
  revalidatePath("/app/clubs");
  return { message: "클럽이 생성되었습니다." };
}

export async function requestClubMembership(formData: FormData) {
  const clubId = formData.get("club_id");
  const auth = await getAuthenticatedUser();
  if (!auth || typeof clubId !== "string") redirect("/login");

  const { data: existing } = await auth.supabase
    .from("club_members")
    .select("status")
    .eq("user_id", auth.user.id)
    .eq("club_id", clubId)
    .maybeSingle();

  if (!existing) {
    await auth.supabase.from("club_members").insert({
      user_id: auth.user.id,
      club_id: clubId,
      role: "member",
      status: "pending",
    });
  }

  revalidatePath("/app/clubs");
  revalidatePath("/app/club");
}

// ─── 회원 관리 (관리자) ──────────────────────────────────

export async function approveMember(userId: string, clubId: string) {
  const auth = await getAuthenticatedUser();
  if (!auth) return;

  await auth.supabase
    .from("club_members")
    .update({
      status: "active",
      joined_at: new Date().toISOString(),
      approved_by: auth.user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("club_id", clubId);

  revalidatePath(`/app/club/${clubId}`);
}

export async function rejectMember(userId: string, clubId: string) {
  const auth = await getAuthenticatedUser();
  if (!auth) return;

  await auth.supabase
    .from("club_members")
    .update({ status: "rejected" })
    .eq("user_id", userId)
    .eq("club_id", clubId);

  revalidatePath(`/app/club/${clubId}`);
}

export async function removeMember(userId: string, clubId: string) {
  const auth = await getAuthenticatedUser();
  if (!auth) return;

  await auth.supabase
    .from("club_members")
    .delete()
    .eq("user_id", userId)
    .eq("club_id", clubId);

  revalidatePath(`/app/club/${clubId}`);
}

export async function updateMemberRole(
  userId: string,
  clubId: string,
  role: "admin" | "member",
) {
  const auth = await getAuthenticatedUser();
  if (!auth) return { error: "Unauthorized" };

  // 관리자 수 제한: owner 포함 3명
  if (role === "admin") {
    const { count } = await auth.supabase
      .from("club_members")
      .select("*", { count: "exact", head: true })
      .eq("club_id", clubId)
      .in("role", ["owner", "admin"]);

    if ((count ?? 0) >= 3) return { error: "임원은 최대 3명까지 임명할 수 있습니다." };
  }

  await auth.supabase
    .from("club_members")
    .update({ role })
    .eq("user_id", userId)
    .eq("club_id", clubId);

  revalidatePath(`/app/club/${clubId}`);
  return {};
}

// ─── 정기모임 ────────────────────────────────────────────

export type MeetingFormState = { errors?: Record<string, string[]>; message?: string };

export async function createMeeting(
  _state: MeetingFormState,
  formData: FormData,
): Promise<MeetingFormState> {
  const auth = await getAuthenticatedUser();
  if (!auth) return { message: "로그인이 필요합니다." };

  const clubId = formData.get("club_id") as string;
  const meetingDate = formData.get("meeting_date") as string;
  const location = formData.get("location") as string;
  const startsAt = formData.get("starts_at") as string | null;
  const voteClosesAt = formData.get("vote_closes_at") as string | null;
  const notes = formData.get("notes") as string | null;

  if (!clubId || !meetingDate || !location) {
    return { errors: { meeting_date: ["필수 항목을 입력해 주세요."] } };
  }

  const { error } = await auth.supabase.from("meetings").insert({
    club_id: clubId,
    meeting_date: meetingDate,
    location,
    starts_at: startsAt || null,
    vote_closes_at: voteClosesAt ? new Date(voteClosesAt).toISOString() : null,
    notes: notes || null,
    status: "voting",
    created_by: auth.user.id,
  });

  if (error) return { message: "모임 생성에 실패했습니다." };

  revalidatePath(`/app/club/${clubId}`);
  return { message: "모임이 생성되었습니다." };
}

export async function closeMeetingVote(meetingId: string, clubId: string) {
  const auth = await getAuthenticatedUser();
  if (!auth) return;

  await auth.supabase
    .from("meetings")
    .update({ status: "confirmed" })
    .eq("id", meetingId);

  revalidatePath(`/app/club/${clubId}`);
  revalidatePath(`/app/club/${clubId}/meeting/${meetingId}`);
}

// ─── 출석 투표 ───────────────────────────────────────────

export async function castVote(
  meetingId: string,
  clubId: string,
  status: "attend" | "absent" | "undecided",
) {
  const auth = await getAuthenticatedUser();
  if (!auth) return;

  await auth.supabase.from("meeting_votes").upsert(
    {
      meeting_id: meetingId,
      user_id: auth.user.id,
      status,
      voted_at: new Date().toISOString(),
    },
    { onConflict: "meeting_id,user_id" },
  );

  revalidatePath(`/app/club/${clubId}/meeting/${meetingId}`);
  revalidatePath(`/app/club/${clubId}`);
  revalidatePath("/app");
}

// ─── 대진표 생성 (KDK) ──────────────────────────────────

export async function generateBracket(meetingId: string, clubId: string) {
  const auth = await getAuthenticatedUser();
  if (!auth) redirect("/login");

  const { data: votes } = await auth.supabase
    .from("meeting_votes")
    .select("user_id, users(id, name)")
    .eq("meeting_id", meetingId)
    .eq("status", "attend");

  if (!votes || votes.length < 4) {
    redirect(`/app/club/${clubId}/meeting/${meetingId}?error=not_enough_players`);
  }

  const players = votes.map((v) => ({
    id: v.user_id,
    name: (v.users as unknown as { name: string } | null)?.name ?? "알 수 없음",
  }));

  const rounds = generateKDKBracket(players);

  await auth.supabase.from("meeting_matches").delete().eq("meeting_id", meetingId);

  const rows = rounds.flatMap((round) =>
    round.matches.map((match, i) => ({
      meeting_id: meetingId,
      round_no: round.roundNo,
      court_no: match.courtNo,
      display_order: i,
      algorithm: "simple" as const,
      team_a_p1: match.teamA[0],
      team_a_p2: match.teamA[1],
      team_b_p1: match.teamB[0],
      team_b_p2: match.teamB[1],
      generated_by: auth.user.id,
    })),
  );

  if (rows.length > 0) {
    await auth.supabase.from("meeting_matches").insert(rows);
  }

  revalidatePath(`/app/club/${clubId}/meeting/${meetingId}`);
  redirect(`/app/club/${clubId}/meeting/${meetingId}/bracket`);
}

// ─── 스코어 입력 ─────────────────────────────────────────

export async function updateMatchScore(
  matchId: string,
  clubId: string,
  meetingId: string,
  scoreA: number,
  scoreB: number,
) {
  const auth = await getAuthenticatedUser();
  if (!auth) return;

  await auth.supabase
    .from("meeting_matches")
    .update({ score_a: scoreA, score_b: scoreB })
    .eq("id", matchId);

  revalidatePath(`/app/club/${clubId}/meeting/${meetingId}/bracket`);
}

// ─── 공지사항 ─────────────────────────────────────────────

export type NoticeFormState = { message?: string };

export async function createNotice(
  _state: NoticeFormState,
  formData: FormData,
): Promise<NoticeFormState> {
  const auth = await getAuthenticatedUser();
  if (!auth) return { message: "로그인이 필요합니다." };

  const clubId = formData.get("club_id") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const isPinned = formData.get("is_pinned") === "on";

  if (!title || !content) return { message: "제목과 내용을 입력해 주세요." };

  const { error } = await auth.supabase.from("club_notices").insert({
    club_id: clubId,
    author_id: auth.user.id,
    title,
    content,
    is_pinned: isPinned,
  });

  if (error) return { message: "공지 작성에 실패했습니다." };

  revalidatePath(`/app/club/${clubId}`);
  return { message: "공지가 등록되었습니다." };
}

// ─── 게시글 ──────────────────────────────────────────────

export type PostFormState = { message?: string };

export async function createPost(
  _state: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const auth = await getAuthenticatedUser();
  if (!auth) return { message: "로그인이 필요합니다." };

  const clubId = formData.get("club_id") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content) return { message: "제목과 내용을 입력해 주세요." };

  const { error } = await auth.supabase.from("posts").insert({
    club_id: clubId,
    author_id: auth.user.id,
    title,
    content,
  });

  if (error) return { message: "게시글 작성에 실패했습니다." };

  revalidatePath(`/app/club/${clubId}`);
  return { message: "게시글이 등록되었습니다." };
}

export async function createComment(formData: FormData) {
  const auth = await getAuthenticatedUser();
  if (!auth) return;

  const postId = formData.get("post_id") as string;
  const clubId = formData.get("club_id") as string;
  const content = formData.get("content") as string;
  const parentId = formData.get("parent_id") as string | null;

  if (!content.trim()) return;

  await auth.supabase.from("comments").insert({
    post_id: postId,
    author_id: auth.user.id,
    content,
    parent_id: parentId || null,
  });

  revalidatePath(`/app/club/${clubId}/board/${postId}`);
}
