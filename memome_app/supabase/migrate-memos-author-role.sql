-- Store memo author role at post time so map cards can show "Added by a local"
-- Run once in Supabase → SQL Editor (after memos.sql + users.sql)

alter table public.memos
  add column if not exists author_role text
  check (author_role is null or author_role in ('visitor', 'local'));

update public.memos m
set author_role = u.role
from public.users u
where m.author_role is null
  and u.auth_id = m.auth_id;
