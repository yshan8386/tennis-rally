"use server";

import { redirect } from "next/navigation";

import { loginSchema, signupSchema, type AuthFormState } from "@/lib/auth-schemas";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function login(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured) {
    return {
      message: "Supabase 환경 변수가 설정되지 않았습니다.",
    };
  }

  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(validated.data);

  if (error) {
    return {
      message: "로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.",
    };
  }

  redirect("/app");
}

export async function signup(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured) {
    return {
      message: "Supabase 환경 변수가 설정되지 않았습니다.",
    };
  }

  const validated = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    gender: formData.get("gender"),
    birth_year: formData.get("birth_year"),
    phone: formData.get("phone"),
    tennis_start_year: formData.get("tennis_start_year"),
    tennis_start_month: formData.get("tennis_start_month"),
    city: formData.get("city"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { email, password, ...profile } = validated.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: profile },
  });

  if (error) {
    return {
      message: "회원가입에 실패했습니다. 이미 가입된 이메일인지 확인해 주세요.",
    };
  }

  if (data.session) {
    redirect("/app");
  }

  redirect("/login?message=signup");
}

export async function logout() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
