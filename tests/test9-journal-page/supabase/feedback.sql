-- MemMe: user feedback submissions (support & help form)
-- Run once in Supabase → SQL Editor (after users.sql)

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  auth_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0 and char_length(name) <= 120),
  email text not null check (char_length(trim(email)) > 0 and char_length(email) <= 254),
  subject text not null check (char_length(trim(subject)) > 0 and char_length(subject) <= 200),
  message text not null check (char_length(trim(message)) > 0 and char_length(message) <= 2000)
);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
create index if not exists feedback_auth_id_idx on public.feedback (auth_id);

alter table public.feedback enable row level security;

drop policy if exists "feedback_insert_own" on public.feedback;
drop policy if exists "feedback_select_own" on public.feedback;

create policy "feedback_insert_own"
  on public.feedback for insert
  to authenticated
  with check ((select auth.uid()) = auth_id);

create policy "feedback_select_own"
  on public.feedback for select
  to authenticated
  using ((select auth.uid()) = auth_id);

grant insert, select on public.feedback to authenticated;
