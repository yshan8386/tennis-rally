"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { signup } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AuthFormState } from "@/lib/auth-schemas";

const initialState: AuthFormState = {};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1959 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

const CITIES = [
  "서울특별시",
  "부산광역시",
  "인천광역시",
  "대구광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기 수원시",
  "경기 성남시",
  "경기 용인시",
  "경기 고양시",
  "경기 화성시",
  "경기 안산시",
  "경기 부천시",
  "경기 남양주시",
  "경기 안양시",
  "경기 평택시",
  "경기 의정부시",
  "경기 파주시",
  "경기 김포시",
  "경기 광명시",
  "경기 시흥시",
  "경기 하남시",
  "경기 구리시",
  "경기 기타",
  "강원 춘천시",
  "강원 원주시",
  "강원 강릉시",
  "강원 기타",
  "충북 청주시",
  "충북 충주시",
  "충북 기타",
  "충남 천안시",
  "충남 아산시",
  "충남 기타",
  "전북 전주시",
  "전북 익산시",
  "전북 군산시",
  "전북 기타",
  "전남 여수시",
  "전남 순천시",
  "전남 목포시",
  "전남 기타",
  "경북 포항시",
  "경북 경주시",
  "경북 구미시",
  "경북 기타",
  "경남 창원시",
  "경남 진주시",
  "경남 김해시",
  "경남 기타",
  "제주특별자치도",
  "해외",
];

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.startsWith("02")) {
    if (digits.length <= 6) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600">{message}</p>;
}

const fieldClass = "h-12 sm:h-10 text-base sm:text-sm";
const selectClass =
  "h-12 sm:h-10 w-full rounded-lg border border-input bg-transparent px-3 text-base sm:text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, initialState);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const passwordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

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
            <Input autoComplete="name" id="name" name="name" className={fieldClass} />
            <FieldError message={state.errors?.name?.[0]} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="email">
              이메일
            </label>
            <Input autoComplete="email" id="email" name="email" type="email" className={fieldClass} />
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
            />
            <FieldError message={state.errors?.password?.[0]} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="password_confirm">
              비밀번호 확인
            </label>
            <Input
              autoComplete="new-password"
              id="password_confirm"
              name="password_confirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className={fieldClass}
            />
            {passwordMismatch && (
              <p className="text-xs text-red-600">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="gender">
              성별
            </label>
            <select className={selectClass} id="gender" name="gender" defaultValue="M">
              <option value="M">남</option>
              <option value="F">여</option>
            </select>
            <FieldError message={state.errors?.gender?.[0]} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="birth_year">
              출생연도
            </label>
            <select className={selectClass} id="birth_year" name="birth_year" defaultValue="">
              <option value="" disabled>선택</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
            <FieldError message={state.errors?.birth_year?.[0]} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="phone">
              핸드폰 번호
            </label>
            <Input
              autoComplete="tel"
              id="phone"
              name="phone"
              inputMode="numeric"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className={fieldClass}
            />
            <FieldError message={state.errors?.phone?.[0]} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="city">
              활동 지역
            </label>
            <select className={selectClass} id="city" name="city" defaultValue="">
              <option value="" disabled>지역 선택</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <FieldError message={state.errors?.city?.[0]} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm font-medium">테니스 시작</label>
            <div className="flex gap-2">
              <select
                className={`${selectClass} w-40`}
                name="tennis_start_year"
                defaultValue=""
              >
                <option value="" disabled>연도 선택</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
              <select
                className={`${selectClass} w-24`}
                name="tennis_start_month"
                defaultValue=""
              >
                <option value="" disabled>월</option>
                {months.map((m) => (
                  <option key={m} value={m}>{m}월</option>
                ))}
              </select>
            </div>
            <FieldError message={state.errors?.tennis_start_year?.[0]} />
            <FieldError message={state.errors?.tennis_start_month?.[0]} />
          </div>

          <div className="space-y-3 sm:col-span-2">
            <Button
              className="h-10 w-full rounded-md"
              disabled={pending || passwordMismatch || password.length === 0 || passwordConfirm.length === 0}
              type="submit"
            >
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
