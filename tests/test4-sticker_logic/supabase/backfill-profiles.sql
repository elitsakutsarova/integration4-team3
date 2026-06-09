-- Run AFTER users.sql — copies existing Supabase Auth users into public.users
-- Supabase → SQL Editor → paste → Run

insert into public.users (auth_id, username, email, role)
select
  au.id,
  coalesce(au.raw_user_meta_data->>'username', '@user'),
  au.email,
  coalesce(au.raw_user_meta_data->>'role', 'visitor')
from auth.users au
where au.email is not null
on conflict (auth_id) do update set
  username = excluded.username,
  email = excluded.email,
  role = excluded.role;
