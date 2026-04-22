# Tennis Rally

테니스 클럽/학원 운영을 위한 모바일 퍼스트 웹앱입니다. 현재 초기 셋업은 PRD와 와이어프레임 문서를 기준으로 Next.js App Router, Tailwind CSS, shadcn/ui, Supabase를 붙일 수 있는 상태까지 구성했습니다.

## Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS v4, shadcn/ui
- Supabase Auth, PostgreSQL, RLS
- Vercel 배포 기준

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`에는 Supabase 프로젝트의 값을 넣습니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Database

물리 설계 SQL은 `supabase/migrations/`에 있습니다. `0001` 실행 후 `0002`를 순서대로 실행합니다.

Supabase CLI를 사용할 경우:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

또는 Supabase SQL Editor에서 `supabase/migrations/0001_initial_schema.sql`, `supabase/migrations/0002_auth_profile_trigger.sql` 순서로 실행하면 됩니다.

## Implemented

- `/login`: Supabase 이메일/비밀번호 로그인
- `/signup`: 회원가입 필드 검증과 Auth 메타데이터 전송
- `/auth/callback`: 이메일 인증 링크 세션 교환
- `/app`: 로그인 후 프로필/소속 클럽 조회 홈
- `/app/clubs`: 클럽 목록 조회, 가입 신청, 새 클럽 생성
- `proxy.ts`: `/app` 보호 및 로그인 상태 사용자의 auth 페이지 접근 정리

## Documents

- `tennis_club_app_PRD.docx`: 제품 요구사항 문서
- `tennis_app_ia_wireframe.html`: IA 및 모바일 화면 기획
- `docs/database-physical-design.md`: 테이블 물리 설계 요약

## Scripts

```bash
npm run dev
npm run build
npm run lint
```
