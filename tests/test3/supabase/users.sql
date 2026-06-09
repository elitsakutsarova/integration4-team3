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
  using (auth.uid() = auth_id);

-- Optional: auto-insert profile on signup (app also inserts via authStore.js)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (auth_id, username, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', '@user'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'visitor')
  )
  on conflict (auth_id) do update set
    username = excluded.username,
    email = excluded.email,
    role = excluded.role;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
