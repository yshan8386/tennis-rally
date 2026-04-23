create or replace function tennis.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = tennis, auth
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  signup_gender text := upper(coalesce(metadata->>'gender', 'M'));
  signup_birth_year int := extract(year from now())::int;
  signup_tennis_year int := extract(year from now())::int;
  signup_tennis_month int := extract(month from now())::int;
begin
  if coalesce(metadata->>'birth_year', '') ~ '^\d{4}$' then
    signup_birth_year := (metadata->>'birth_year')::int;
  end if;

  if coalesce(metadata->>'tennis_start_year', '') ~ '^\d{4}$' then
    signup_tennis_year := (metadata->>'tennis_start_year')::int;
  end if;

  if coalesce(metadata->>'tennis_start_month', '') ~ '^\d{1,2}$' then
    signup_tennis_month := greatest(1, least(12, (metadata->>'tennis_start_month')::int));
  end if;

  insert into tennis.users (
    id,
    email,
    name,
    gender,
    birth_year,
    phone,
    tennis_start_year,
    tennis_start_month,
    city,
    role
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(metadata->>'name', ''), split_part(coalesce(new.email, 'user'), '@', 1), '사용자'),
    case when signup_gender in ('M', 'F') then signup_gender::tennis.gender_type else 'M'::tennis.gender_type end,
    signup_birth_year,
    coalesce(metadata->>'phone', ''),
    signup_tennis_year,
    signup_tennis_month,
    coalesce(nullif(metadata->>'city', ''), '미입력'),
    'user'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function tennis.handle_new_auth_user();
