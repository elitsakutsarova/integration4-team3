-- MemMe: public map memos (readable by everyone, created by signed-in users)
-- Run once in Supabase → SQL Editor (after users.sql)

create table if not exists public.memos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  auth_id uuid not null references auth.users (id) on delete cascade,
  quote text not null check (char_length(trim(quote)) > 0 and char_length(quote) <= 100),
  lat double precision not null,
  lng double precision not null,
  location text not null default 'My spot',
  tags text[] not null default '{}',
  media_url text,
  media_type text check (media_type is null or media_type in ('image', 'video'))
);

create index if not exists memos_created_at_idx on public.memos (created_at desc);

alter table public.memos enable row level security;

drop policy if exists "memos_select_all" on public.memos;
drop policy if exists "memos_insert_own" on public.memos;
drop policy if exists "memos_update_own" on public.memos;

-- Everyone (guests + signed-in) can read all memos on the map
create policy "memos_select_all"
  on public.memos for select
  to anon, authenticated
  using (true);

-- Signed-in users can only insert memos for themselves
create policy "memos_insert_own"
  on public.memos for insert
  to authenticated
  with check ((select auth.uid()) = auth_id);

-- Signed-in users can only update their own memos
create policy "memos_update_own"
  on public.memos for update
  to authenticated
  using ((select auth.uid()) = auth_id)
  with check ((select auth.uid()) = auth_id);

grant select on public.memos to anon, authenticated;
grant insert on public.memos to authenticated;
grant update on public.memos to authenticated;
