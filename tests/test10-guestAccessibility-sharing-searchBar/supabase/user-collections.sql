-- MemMe: saved discover events/places and saved map memos (per-user collections)
-- Run once in Supabase → SQL Editor (after users.sql)

create table if not exists public.user_saved_events (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null references auth.users (id) on delete cascade,
  event_id text not null,
  saved_at timestamptz not null default now(),
  unique (auth_id, event_id)
);

create table if not exists public.user_saved_places (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null references auth.users (id) on delete cascade,
  place_id text not null,
  saved_at timestamptz not null default now(),
  unique (auth_id, place_id)
);

create table if not exists public.user_saved_memos (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null references auth.users (id) on delete cascade,
  memo_id text not null,
  saved_at timestamptz not null default now(),
  unique (auth_id, memo_id)
);

create index if not exists user_saved_events_auth_idx
  on public.user_saved_events (auth_id);

create index if not exists user_saved_places_auth_idx
  on public.user_saved_places (auth_id);

create index if not exists user_saved_memos_auth_idx
  on public.user_saved_memos (auth_id);

alter table public.user_saved_events enable row level security;
alter table public.user_saved_places enable row level security;
alter table public.user_saved_memos enable row level security;

-- Events
drop policy if exists "user_saved_events_select_own" on public.user_saved_events;
create policy "user_saved_events_select_own"
  on public.user_saved_events for select
  to authenticated
  using (auth.uid() = auth_id);

drop policy if exists "user_saved_events_insert_own" on public.user_saved_events;
create policy "user_saved_events_insert_own"
  on public.user_saved_events for insert
  to authenticated
  with check (auth.uid() = auth_id);

drop policy if exists "user_saved_events_delete_own" on public.user_saved_events;
create policy "user_saved_events_delete_own"
  on public.user_saved_events for delete
  to authenticated
  using (auth.uid() = auth_id);

-- Places
drop policy if exists "user_saved_places_select_own" on public.user_saved_places;
create policy "user_saved_places_select_own"
  on public.user_saved_places for select
  to authenticated
  using (auth.uid() = auth_id);

drop policy if exists "user_saved_places_insert_own" on public.user_saved_places;
create policy "user_saved_places_insert_own"
  on public.user_saved_places for insert
  to authenticated
  with check (auth.uid() = auth_id);

drop policy if exists "user_saved_places_delete_own" on public.user_saved_places;
create policy "user_saved_places_delete_own"
  on public.user_saved_places for delete
  to authenticated
  using (auth.uid() = auth_id);

-- Memos
drop policy if exists "user_saved_memos_select_own" on public.user_saved_memos;
create policy "user_saved_memos_select_own"
  on public.user_saved_memos for select
  to authenticated
  using (auth.uid() = auth_id);

drop policy if exists "user_saved_memos_insert_own" on public.user_saved_memos;
create policy "user_saved_memos_insert_own"
  on public.user_saved_memos for insert
  to authenticated
  with check (auth.uid() = auth_id);

drop policy if exists "user_saved_memos_delete_own" on public.user_saved_memos;
create policy "user_saved_memos_delete_own"
  on public.user_saved_memos for delete
  to authenticated
  using (auth.uid() = auth_id);

grant select, insert, delete on public.user_saved_events to authenticated;
grant select, insert, delete on public.user_saved_places to authenticated;
grant select, insert, delete on public.user_saved_memos to authenticated;
