-- Run in Supabase → SQL Editor if profile save fails with RLS errors
-- (after users.sql)

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
  on public.users for update
  using (auth.uid() = auth_id)
  with check (auth.uid() = auth_id);

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
