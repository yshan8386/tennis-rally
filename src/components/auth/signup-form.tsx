"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signup } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AuthFormState } from "@/lib/auth-schemas";

const initialState: AuthFormState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-red-600">{message}</p>;
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, initialState);

  return (
    <Card className="w-full max-w-2xl rounded-lg border-zinc-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-xl">회원가입</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 sm:grid-cols-2">
          {state.message ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">
              {state.message}
            </p>
          ) : null}

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="name">
              이름
            </label>
            <Input autoComplete="name" id="name" name="name" />
            <FieldError message={state.errors?.name?.[0]} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="email">
              이메일
            </label>
            <Input autoComplete="email" id="email" name="email" type="email" />
            <FieldError message={state.errors?.email?.[0]} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="password">
              비밀번호
            </label>
            <Input
              autoComplete="new-password"
              id="password"
              name="password"
              type="password"
            />
            <FieldError message={state.errors?.password?.[0]} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="gender">
              성별
            </label>
            <select
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              id="gender"
              name="gender"
              defaultValue="M"
            >
              <option value="M">남</option>
              <option value="F">여</option>
            </select>
            <FieldError message={state.errors?.gender?.[0]} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="birth_year">
              출생연도
            </label>
            <Input id="birth_year" inputMode="numeric" name="birth_year" />
            <FieldError message={state.errors?.birth_year?.[0]} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="phone">
              핸드폰 번호
            </label>
            <Input autoComplete="tel" id="phone" name="phone" placeholder="010-0000-0000" />
            <FieldError message={state.errors?.phone?.[0]} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="tennis_start_year">
              테니스 시작 연도
            </label>
            <Input
              id="tennis_start_year"
              inputMode="numeric"
              name="tennis_start_year"
              placeholder="2019"
            />
            <FieldError message={state.errors?.tennis_start_year?.[0]} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="tennis_start_month">
              테니스 시작 월
            </label>
            <Input
              id="tennis_start_month"
              inputMode="numeric"
              name="tennis_start_month"
              placeholder="3"
            />
            <FieldError message={state.errors?.tennis_start_month?.[0]} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm font-medium" htmlFor="city">
              활동 지역
            </label>
            <Input id="city" name="city" placeholder="서울시" />
            <FieldError message={state.errors?.city?.[0]} />
          </div>

          <div className="space-y-3 sm:col-span-2">
            <Button className="h-10 w-full rounded-md" disabled={pending} type="submit">
              {pending ? "가입 처리 중..." : "가입 신청하기"}
            </Button>
            <p className="text-center text-sm text-zinc-500">
              이미 계정이 있나요?{" "}
              <Link className="font-medium text-zinc-950 underline" href="/login">
                로그인
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
