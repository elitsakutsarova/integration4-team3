-- Run in Supabase → SQL Editor when username login fails silently.
-- Guests cannot read public.users because of RLS; this RPC resolves the auth email safely.

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
