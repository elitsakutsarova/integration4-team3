-- Run in Supabase → SQL Editor when signup shows:
--   "Database error saving new user"
--   or when duplicate usernames are not caught on the register form.
--
-- Adds a public username check for guests and hardens the signup trigger.

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
