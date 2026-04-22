create extension if not exists "pgcrypto";

create type public.app_role as enum ('user', 'club_admin', 'superadmin');
create type public.gender_type as enum ('M', 'F');
create type public.club_type as enum ('club', 'academy');
create type public.club_member_role as enum ('owner', 'admin', 'member');
create type public.club_member_status as enum ('pending', 'active', 'rejected', 'suspended');
create type public.meeting_status as enum ('scheduled', 'voting', 'confirmed', 'completed', 'cancelled');
create type public.vote_status as enum ('attend', 'absent', 'undecided');
create type public.draw_algorithm as enum ('simple', 'hanol');
create type public.tournament_status as enum ('upcoming', 'ongoing', 'completed', 'cancelled');
create type public.tour_type as enum ('ATP', 'WTA');
create type public.court_surface as enum ('clay', 'hard', 'grass', 'indoor_hard');
create type public.match_winner_side as enum ('A', 'B', 'DRAW');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  gender public.gender_type not null,
  birth_year int not null check (birth_year between 1900 and 2100),
  phone text not null,
  tennis_start_year int not null check (tennis_start_year between 1900 and 2100),
  tennis_start_month int not null check (tennis_start_month between 1 and 12),
  city text not null,
  role public.app_role not null default 'user',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  type public.club_type not null,
  city text not null,
  description text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.club_members (
  user_id uuid not null references public.users(id) on delete cascade,
  club_id uuid not null references public.clubs(id) on delete cascade,
  role public.club_member_role not null default 'member',
  status public.club_member_status not null default 'pending',
  requested_at timestamptz not null default now(),
  joined_at timestamptz,
  approved_by uuid references public.users(id) on delete set null,
  approved_at timestamptz,
  primary key (user_id, club_id)
);

create table public.club_notices (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  author_id uuid references public.users(id) on delete set null,
  title text not null,
  content text not null,
  is_pinned boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  meeting_date date not null,
  starts_at time,
  location text not null,
  status public.meeting_status not null default 'scheduled',
  vote_closes_at timestamptz,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.meeting_votes (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status public.vote_status not null default 'undecided',
  voted_at timestamptz not null default now(),
  unique (meeting_id, user_id)
);

create table public.meeting_matches (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  round_no int not null check (round_no > 0),
  court_no int check (court_no > 0),
  display_order int not null default 0,
  algorithm public.draw_algorithm not null default 'simple',
  team_a_p1 uuid not null references public.users(id) on delete restrict,
  team_a_p2 uuid not null references public.users(id) on delete restrict,
  team_b_p1 uuid not null references public.users(id) on delete restrict,
  team_b_p2 uuid not null references public.users(id) on delete restrict,
  score_a int check (score_a >= 0),
  score_b int check (score_b >= 0),
  generated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    team_a_p1 <> team_a_p2
    and team_a_p1 <> team_b_p1
    and team_a_p1 <> team_b_p2
    and team_a_p2 <> team_b_p1
    and team_a_p2 <> team_b_p2
    and team_b_p1 <> team_b_p2
  )
);

create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  tournament_date date not null,
  location text,
  entry_fee int not null default 0 check (entry_fee >= 0),
  status public.tournament_status not null default 'upcoming',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tournament_participants (
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  seed_no int check (seed_no > 0),
  paid_amount int not null default 0 check (paid_amount >= 0),
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (tournament_id, user_id)
);

create table public.tournament_matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  round_no int not null check (round_no > 0),
  match_no int not null check (match_no > 0),
  team_a_p1 uuid references public.users(id) on delete restrict,
  team_a_p2 uuid references public.users(id) on delete restrict,
  team_b_p1 uuid references public.users(id) on delete restrict,
  team_b_p2 uuid references public.users(id) on delete restrict,
  score_a int check (score_a >= 0),
  score_b int check (score_b >= 0),
  winner_side public.match_winner_side,
  played_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tournament_id, round_no, match_no)
);

create table public.awards (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  tournament_id uuid references public.tournaments(id) on delete set null,
  award_type text not null,
  awarded_at date not null,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  author_id uuid references public.users(id) on delete set null,
  title text not null,
  content text not null,
  view_count int not null default 0 check (view_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid references public.users(id) on delete set null,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_id is null or parent_id <> id)
);

create table public.atp_tournaments (
  id uuid primary key default gen_random_uuid(),
  tour_type public.tour_type not null,
  category text not null,
  name text not null,
  location text,
  surface public.court_surface not null,
  start_date date not null,
  end_date date not null,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table public.atp_matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.atp_tournaments(id) on delete cascade,
  round text not null,
  player1 text not null,
  player2 text not null,
  winner text,
  set_scores jsonb not null default '[]'::jsonb,
  match_date date not null,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(set_scores) = 'array')
);

create index club_members_club_id_status_idx on public.club_members (club_id, status);
create index club_members_user_id_status_idx on public.club_members (user_id, status);
create index club_notices_club_published_idx on public.club_notices (club_id, is_pinned desc, published_at desc);
create index meetings_club_date_idx on public.meetings (club_id, meeting_date desc);
create index meeting_votes_meeting_status_idx on public.meeting_votes (meeting_id, status);
create index meeting_matches_meeting_round_idx on public.meeting_matches (meeting_id, round_no, display_order);
create index tournaments_club_date_idx on public.tournaments (club_id, tournament_date desc);
create index awards_user_awarded_idx on public.awards (user_id, awarded_at desc);
create index posts_club_created_idx on public.posts (club_id, created_at desc);
create index comments_post_created_idx on public.comments (post_id, created_at);
create index comments_parent_idx on public.comments (parent_id) where parent_id is not null;
create index atp_tournaments_dates_idx on public.atp_tournaments (tour_type, start_date desc);
create index atp_matches_tournament_date_idx on public.atp_matches (tournament_id, match_date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger clubs_set_updated_at
before update on public.clubs
for each row execute function public.set_updated_at();

create trigger club_notices_set_updated_at
before update on public.club_notices
for each row execute function public.set_updated_at();

create trigger meetings_set_updated_at
before update on public.meetings
for each row execute function public.set_updated_at();

create trigger meeting_matches_set_updated_at
before update on public.meeting_matches
for each row execute function public.set_updated_at();

create trigger tournaments_set_updated_at
before update on public.tournaments
for each row execute function public.set_updated_at();

create trigger tournament_matches_set_updated_at
before update on public.tournament_matches
for each row execute function public.set_updated_at();

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

create trigger comments_set_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

create trigger atp_tournaments_set_updated_at
before update on public.atp_tournaments
for each row execute function public.set_updated_at();

create trigger atp_matches_set_updated_at
before update on public.atp_matches
for each row execute function public.set_updated_at();

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'superadmin'
  );
$$;

create or replace function public.is_active_club_member(target_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_superadmin()
    or exists (
      select 1
      from public.club_members cm
      where cm.club_id = target_club_id
        and cm.user_id = auth.uid()
        and cm.status = 'active'
    );
$$;

create or replace function public.is_club_admin(target_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_superadmin()
    or exists (
      select 1
      from public.club_members cm
      where cm.club_id = target_club_id
        and cm.user_id = auth.uid()
        and cm.status = 'active'
        and cm.role in ('owner', 'admin')
    );
$$;

create or replace function public.shares_active_club_with(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_user_id = auth.uid()
    or public.is_superadmin()
    or exists (
      select 1
      from public.club_members mine
      join public.club_members peer on peer.club_id = mine.club_id
      where mine.user_id = auth.uid()
        and mine.status = 'active'
        and peer.user_id = target_user_id
        and peer.status = 'active'
    );
$$;

create or replace function public.can_access_meeting(target_meeting_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.meetings m
    where m.id = target_meeting_id
      and public.is_active_club_member(m.club_id)
  );
$$;

create or replace function public.can_manage_meeting(target_meeting_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.meetings m
    where m.id = target_meeting_id
      and public.is_club_admin(m.club_id)
  );
$$;

create or replace function public.can_access_tournament(target_tournament_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tournaments t
    where t.id = target_tournament_id
      and public.is_active_club_member(t.club_id)
  );
$$;

create or replace function public.can_manage_tournament(target_tournament_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tournaments t
    where t.id = target_tournament_id
      and public.is_club_admin(t.club_id)
  );
$$;

create or replace function public.can_access_post(target_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.posts p
    where p.id = target_post_id
      and public.is_active_club_member(p.club_id)
  );
$$;

create or replace function public.can_manage_post(target_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.posts p
    where p.id = target_post_id
      and public.is_club_admin(p.club_id)
  );
$$;

create or replace function public.prevent_user_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_superadmin() then
    raise exception 'Only a superadmin can change app roles.';
  end if;

  return new;
end;
$$;

create trigger users_prevent_role_escalation
before update of role on public.users
for each row execute function public.prevent_user_role_escalation();

create or replace function public.create_owner_membership_for_new_club()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is not null then
    insert into public.club_members (
      user_id,
      club_id,
      role,
      status,
      joined_at,
      approved_by,
      approved_at
    )
    values (
      new.created_by,
      new.id,
      'owner',
      'active',
      now(),
      new.created_by,
      now()
    )
    on conflict (user_id, club_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger clubs_create_owner_membership
after insert on public.clubs
for each row execute function public.create_owner_membership_for_new_club();

create or replace function public.validate_comment_parent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  parent_post_id uuid;
  grandparent_id uuid;
begin
  if new.parent_id is null then
    return new;
  end if;

  select post_id, parent_id
    into parent_post_id, grandparent_id
  from public.comments
  where id = new.parent_id;

  if parent_post_id is null then
    raise exception 'Parent comment does not exist.';
  end if;

  if parent_post_id <> new.post_id then
    raise exception 'Parent comment must belong to the same post.';
  end if;

  if grandparent_id is not null then
    raise exception 'Only one reply depth is allowed.';
  end if;

  return new;
end;
$$;

create trigger comments_validate_parent
before insert or update of parent_id, post_id on public.comments
for each row execute function public.validate_comment_parent();

alter table public.users enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
alter table public.club_notices enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_votes enable row level security;
alter table public.meeting_matches enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_participants enable row level security;
alter table public.tournament_matches enable row level security;
alter table public.awards enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.atp_tournaments enable row level security;
alter table public.atp_matches enable row level security;

create policy "users can read self or club peers"
on public.users for select
to authenticated
using (public.shares_active_club_with(id));

create policy "users can insert own profile"
on public.users for insert
to authenticated
with check (id = auth.uid() and role = 'user');

create policy "users can update own profile"
on public.users for update
to authenticated
using (id = auth.uid() or public.is_superadmin())
with check (id = auth.uid() or public.is_superadmin());

create policy "clubs are visible for signup and members"
on public.clubs for select
to anon, authenticated
using (true);

create policy "authenticated users can create clubs"
on public.clubs for insert
to authenticated
with check (created_by = auth.uid());

create policy "club admins can update clubs"
on public.clubs for update
to authenticated
using (public.is_club_admin(id))
with check (public.is_club_admin(id));

create policy "club owners can delete clubs"
on public.clubs for delete
to authenticated
using (
  public.is_superadmin()
  or exists (
    select 1
    from public.club_members cm
    where cm.club_id = clubs.id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
      and cm.role = 'owner'
  )
);

create policy "members can read relevant memberships"
on public.club_members for select
to authenticated
using (user_id = auth.uid() or public.is_active_club_member(club_id));

create policy "users can request membership"
on public.club_members for insert
to authenticated
with check (
  public.is_club_admin(club_id)
  or (
    user_id = auth.uid()
    and role = 'member'
    and status = 'pending'
  )
);

create policy "club admins can update memberships"
on public.club_members for update
to authenticated
using (public.is_club_admin(club_id))
with check (public.is_club_admin(club_id));

create policy "members can leave or admins can remove"
on public.club_members for delete
to authenticated
using (user_id = auth.uid() or public.is_club_admin(club_id));

create policy "club members can read notices"
on public.club_notices for select
to authenticated
using (public.is_active_club_member(club_id));

create policy "club admins can manage notices"
on public.club_notices for all
to authenticated
using (public.is_club_admin(club_id))
with check (public.is_club_admin(club_id));

create policy "club members can read meetings"
on public.meetings for select
to authenticated
using (public.is_active_club_member(club_id));

create policy "club admins can manage meetings"
on public.meetings for all
to authenticated
using (public.is_club_admin(club_id))
with check (public.is_club_admin(club_id));

create policy "club members can read meeting votes"
on public.meeting_votes for select
to authenticated
using (public.can_access_meeting(meeting_id));

create policy "members can create own meeting vote"
on public.meeting_votes for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.can_access_meeting(meeting_id)
  and exists (
    select 1
    from public.meetings m
    where m.id = meeting_votes.meeting_id
      and m.status in ('scheduled', 'voting')
  )
);

create policy "members can update own meeting vote"
on public.meeting_votes for update
to authenticated
using (user_id = auth.uid() and public.can_access_meeting(meeting_id))
with check (user_id = auth.uid() and public.can_access_meeting(meeting_id));

create policy "members can delete own meeting vote"
on public.meeting_votes for delete
to authenticated
using (user_id = auth.uid() or public.can_manage_meeting(meeting_id));

create policy "club members can read meeting matches"
on public.meeting_matches for select
to authenticated
using (public.can_access_meeting(meeting_id));

create policy "club admins can manage meeting matches"
on public.meeting_matches for all
to authenticated
using (public.can_manage_meeting(meeting_id))
with check (public.can_manage_meeting(meeting_id));

create policy "club members can read tournaments"
on public.tournaments for select
to authenticated
using (public.is_active_club_member(club_id));

create policy "club admins can manage tournaments"
on public.tournaments for all
to authenticated
using (public.is_club_admin(club_id))
with check (public.is_club_admin(club_id));

create policy "club members can read tournament participants"
on public.tournament_participants for select
to authenticated
using (public.can_access_tournament(tournament_id));

create policy "club admins can manage tournament participants"
on public.tournament_participants for all
to authenticated
using (public.can_manage_tournament(tournament_id))
with check (public.can_manage_tournament(tournament_id));

create policy "club members can read tournament matches"
on public.tournament_matches for select
to authenticated
using (public.can_access_tournament(tournament_id));

create policy "club admins can manage tournament matches"
on public.tournament_matches for all
to authenticated
using (public.can_manage_tournament(tournament_id))
with check (public.can_manage_tournament(tournament_id));

create policy "club members can read awards"
on public.awards for select
to authenticated
using (user_id = auth.uid() or public.is_active_club_member(club_id));

create policy "club admins can manage awards"
on public.awards for all
to authenticated
using (public.is_club_admin(club_id))
with check (public.is_club_admin(club_id));

create policy "club members can read posts"
on public.posts for select
to authenticated
using (public.is_active_club_member(club_id));

create policy "club members can create posts"
on public.posts for insert
to authenticated
with check (author_id = auth.uid() and public.is_active_club_member(club_id));

create policy "authors or admins can update posts"
on public.posts for update
to authenticated
using (author_id = auth.uid() or public.is_club_admin(club_id))
with check (author_id = auth.uid() or public.is_club_admin(club_id));

create policy "authors or admins can delete posts"
on public.posts for delete
to authenticated
using (author_id = auth.uid() or public.is_club_admin(club_id));

create policy "club members can read comments"
on public.comments for select
to authenticated
using (public.can_access_post(post_id));

create policy "club members can create comments"
on public.comments for insert
to authenticated
with check (author_id = auth.uid() and public.can_access_post(post_id));

create policy "authors or post admins can update comments"
on public.comments for update
to authenticated
using (author_id = auth.uid() or public.can_manage_post(post_id))
with check (author_id = auth.uid() or public.can_manage_post(post_id));

create policy "authors or post admins can delete comments"
on public.comments for delete
to authenticated
using (author_id = auth.uid() or public.can_manage_post(post_id));

create policy "tour tournaments are public readable"
on public.atp_tournaments for select
to anon, authenticated
using (true);

create policy "superadmins can manage tour tournaments"
on public.atp_tournaments for all
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

create policy "tour matches are public readable"
on public.atp_matches for select
to anon, authenticated
using (true);

create policy "superadmins can manage tour matches"
on public.atp_matches for all
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());
