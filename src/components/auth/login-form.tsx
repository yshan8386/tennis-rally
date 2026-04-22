"use client";

import Link from "next/link";
import { useActionState } from "react";

import { login } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AuthFormState } from "@/lib/auth-schemas";

const initialState: AuthFormState = {};

export function LoginForm({ message }: { message?: string }) {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <Card className="w-full max-w-md rounded-lg border-zinc-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-xl">로그인</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {message ? (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}
          {state.message ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.message}
            </p>
          ) : null}

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="email">
              이메일
            </label>
            <Input
              autoComplete="email"
              id="email"
              name="email"
              placeholder="email@example.com"
              type="email"
            />
            {state.errors?.email?.[0] ? (
              <p className="text-xs text-red-600">{state.errors.email[0]}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="password">
              비밀번호
            </label>
            <Input
              autoComplete="current-password"
              id="password"
              name="password"
              type="password"
            />
            {state.errors?.password?.[0] ? (
              <p className="text-xs text-red-600">{state.errors.password[0]}</p>
            ) : null}
          </div>

          <Button className="h-10 w-full rounded-md" disabled={pending} type="submit">
            {pending ? "로그인 중..." : "로그인"}
          </Button>

          <p className="text-center text-sm text-zinc-500">
            아직 계정이 없나요?{" "}
            <Link className="font-medium text-zinc-950 underline" href="/signup">
              회원가입
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
