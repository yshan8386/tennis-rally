# Tennis Rally DB Physical Design

기준 문서: `tennis_club_app_PRD.docx`, `tennis_app_ia_wireframe.html`

SQL 원본: `supabase/migrations/0001_initial_schema.sql`

## 설계 방향

- Supabase Auth의 `auth.users.id`를 `public.users.id`와 1:1로 연결합니다.
- 클럽 격리는 `club_members`의 `status = 'active'` 멤버십을 기준으로 RLS를 적용합니다.
- 회원가입과 마이페이지 요구사항을 위해 `club_members.status`에 승인 대기 상태를 포함했습니다.
- 정기모임은 투표(`meeting_votes`)와 생성된 복식 경기(`meeting_matches`)를 분리했습니다.
- 자유게시판은 게시글(`posts`)과 댓글(`comments`)을 분리하고, 대댓글은 1단계까지만 허용합니다.
- ATP/WTA 데이터는 PRD 범위상 외부 sync 전제이므로 공개 조회, 슈퍼어드민 쓰기 권한으로 설계했습니다.

## 주요 테이블

| 영역 | 테이블 | 설명 |
| --- | --- | --- |
| 인증/회원 | `users` | Supabase Auth UID 기반 사용자 프로필 |
| 클럽 | `clubs` | 클럽/학원 기본 정보 |
| 클럽 | `club_members` | 사용자와 클럽 N:M, 역할과 승인 상태 |
| 클럽 | `club_notices` | 클럽 공지사항 |
| 정기모임 | `meetings` | 모임 날짜, 장소, 투표 마감, 상태 |
| 정기모임 | `meeting_votes` | 참석/불참/미정 투표, 1인 1표 |
| 정기모임 | `meeting_matches` | 복식 대진표, 라운드, 코트, 스코어 |
| 대회 | `tournaments` | 클럽 대회 기본 정보 |
| 대회 | `tournament_participants` | 클럽 대회 참가자와 참가비 처리 |
| 대회 | `tournament_matches` | 대회 브래킷/경기 결과 |
| 이력 | `awards` | 사용자 수상 경력 |
| 게시판 | `posts` | 클럽 자유게시판 게시글 |
| 게시판 | `comments` | 댓글과 1단계 대댓글 |
| ATP/WTA | `atp_tournaments` | ATP/WTA 대회 데이터 |
| ATP/WTA | `atp_matches` | ATP/WTA 경기 결과와 JSONB 세트 스코어 |

## RLS 원칙

- `clubs`: 회원가입 클럽 선택을 위해 익명/인증 사용자 모두 조회 가능
- 클럽 내부 데이터: 활성 클럽원만 조회 가능
- 클럽 운영 데이터 생성/수정/삭제: `owner`, `admin`, `superadmin`
- 투표: 활성 클럽원이 자기 투표만 생성/수정 가능
- 게시판: 활성 클럽원 작성 가능, 작성자 또는 클럽 관리자만 수정/삭제 가능
- ATP/WTA: 익명 조회 가능, 쓰기는 `superadmin`만 가능

## 적용 쿼리

아래 파일이 바로 실행 가능한 Supabase PostgreSQL 마이그레이션입니다.

```text
supabase/migrations/0001_initial_schema.sql
```

Supabase CLI:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

SQL Editor:

1. Supabase Dashboard의 SQL Editor를 엽니다.
2. `supabase/migrations/0001_initial_schema.sql` 내용을 전체 붙여 넣습니다.
3. 실행 후 Authentication 설정에서 이메일 로그인을 활성화합니다.

## 후속 결정 필요

- 클럽 가입 승인 방식: 초대 코드, 관리자 승인, 자유 가입 중 선택
- ATP/WTA 데이터 소스와 sync job 주기
- 정기모임 Hanol 알고리즘 적용 인원 기준
- 클럽 관리자 전용 화면 범위
