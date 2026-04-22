"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClubSchema, type ClubFormState } from "@/lib/club-schemas";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

async function getAuthenticatedUser() {
  if (!isSupabaseConfigured) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return { supabase, user };
}

export async function createClub(
  _state: ClubFormState,
  formData: FormData,
): Promise<ClubFormState> {
  const auth = await getAuthenticatedUser();

  if (!auth) {
    return {
      message: "로그인이 필요합니다.",
    };
  }

  const validated = createClubSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    city: formData.get("city"),
    description: formData.get("description"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { error } = await auth.supabase.from("clubs").insert({
    ...validated.data,
    created_by: auth.user.id,
  });

  if (error) {
    return {
      message: "클럽 생성에 실패했습니다. 입력값을 확인해 주세요.",
    };
  }

  revalidatePath("/app");
  revalidatePath("/app/clubs");

  return {
    message: "클럽이 생성되었습니다.",
  };
}

export async function requestClubMembership(formData: FormData) {
  const clubId = formData.get("club_id");
  const auth = await getAuthenticatedUser();

  if (!auth || typeof clubId !== "string") {
    redirect("/login");
  }

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

  revalidatePath("/app");
  revalidatePath("/app/clubs");
}
