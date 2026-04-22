"use client";

import { useActionState } from "react";

import { createClub } from "@/app/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ClubFormState } from "@/lib/club-schemas";

const initialState: ClubFormState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-red-600">{message}</p>;
}

export function CreateClubForm() {
  const [state, action, pending] = useActionState(createClub, initialState);

  return (
    <form action={action} className="space-y-3">
      {state.message ? (
        <p className="rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
          {state.message}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="name">
          클럽명
        </label>
        <Input id="name" name="name" placeholder="한빛 테니스 클럽" />
        <FieldError message={state.errors?.name?.[0]} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="type">
            타입
          </label>
          <select
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            defaultValue="club"
            id="type"
            name="type"
          >
            <option value="club">클럽</option>
            <option value="academy">학원</option>
          </select>
          <FieldError message={state.errors?.type?.[0]} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="city">
            소재지
          </label>
          <Input id="city" name="city" placeholder="서울시" />
          <FieldError message={state.errors?.city?.[0]} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="description">
          소개
        </label>
        <Input id="description" name="description" placeholder="정기모임과 복식 위주의 클럽" />
      </div>

      <Button className="h-10 w-full rounded-md" disabled={pending} type="submit">
        {pending ? "생성 중..." : "클럽 만들기"}
      </Button>
    </form>
  );
}
