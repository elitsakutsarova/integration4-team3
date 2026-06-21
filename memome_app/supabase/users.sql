-- MemMe: wire your EXISTING users table to Supabase Auth
-- Run once in Supabase → SQL Editor
--
-- Your table today:
--   id          int8 PK (auto)
--   created_at  timestamptz
--   username    text
--   email       text
--
-- Supabase Auth (auth.users) stores email + password separately.
-- We add auth_id to link each profile row to the logged-in auth user.

alter table public.users
  add column if not exists auth_id uuid unique references auth.users(id) on delete cascade,
  add column if not exists role text default 'visitor' check (role in ('visitor', 'local'));

alter table public.users enable row level security;

drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own" on public.users;

create policy "users_select_own"
  on public.users for select
  using (auth.uid() = auth_id);

create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = auth_id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = auth_id)
  with check (auth.uid() = auth_id);

-- Reliable profile save from the app (bypasses RLS edge cases on upsert / legacy rows)
create or replace function public.upsert_own_profile(
  p_username text,
  p_email text,
  p_role text default 'visitor'
)
returns setof public.users
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.users
  set auth_id = auth.uid(),
      username = coalesce(nullif(p_username, ''), username),
      role = coalesce(nullif(p_role, ''), role)
  where lower(email) = lower(p_email)
    and auth_id is null;

  return query
  insert into public.users (auth_id, username, email, role)
  values (auth.uid(), p_username, p_email, p_role)
  on conflict (auth_id) do update set
    username = excluded.username,
    email = excluded.email,
    role = excluded.role
  returning *;
end;
$$;

revoke all on function public.upsert_own_profile(text, text, text) from public;
grant execute on function public.upsert_own_profile(text, text, text) to authenticated;

-- Signup / register: check username without exposing other profile data
create or replace function public.is_username_taken(p_username text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users
    where lower(username) = lower(p_username)
  );
$$;

revoke all on function public.is_username_taken(text) from public;
grant execute on function public.is_username_taken(text) to anon, authenticated;

-- Login: resolve auth email from username before the user is authenticated (RLS blocks direct reads)
create or replace function public.resolve_login_email(p_username text)
returns text
language sql
security definer
set search_path = public, auth
stable
as $$
  select au.email
  from auth.users au
  left join public.users u on u.auth_id = au.id
  where lower(coalesce(u.username, au.raw_user_meta_data->>'username')) = lower(trim(p_username))
  limit 1;
$$;

revoke all on function public.resolve_login_email(text) from public;
grant execute on function public.resolve_login_email(text) to anon, authenticated;

-- Forgot password: check email exists without exposing profile data
create or replace function public.is_email_registered(p_email text)
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1
    from auth.users
    where lower(email) = lower(trim(p_email))
  );
$$;

revoke all on function public.is_email_registered(text) from public;
grant execute on function public.is_email_registered(text) to anon, authenticated;

-- Optional: auto-insert profile on signup (app also inserts via authStore.js)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
  v_role text;
begin
  v_username := coalesce(nullif(trim(new.raw_user_meta_data->>'username'), ''), '@user');
  v_role := coalesce(nullif(trim(new.raw_user_meta_data->>'role'), ''), 'visitor');

  if v_role not in ('visitor', 'local') then
    v_role := 'visitor';
  end if;

  update public.users
  set auth_id = new.id,
      username = v_username,
      role = v_role
  where lower(email) = lower(new.email)
    and auth_id is null;

  if found then
    return new;
  end if;

  if exists (
    select 1
    from public.users
    where lower(username) = lower(v_username)
      and (auth_id is null or auth_id <> new.id)
  ) then
    raise exception 'Username already taken';
  end if;

  insert into public.users (auth_id, username, email, role)
  values (new.id, v_username, new.email, v_role)
  on conflict (auth_id) do update set
    username = excluded.username,
    email = excluded.email,
    role = excluded.role;

  return new;
exception
  when unique_violation then
    if exists (
      select 1
      from public.users
      where lower(username) = lower(v_username)
    ) then
      raise exception 'Username already taken';
    end if;
    raise exception 'Email already taken';
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
