-- MemMe: physical QR → digital collectible stickers
-- Run once in Supabase → SQL Editor (after users.sql)

-- ─── Catalog (seed data matches public/*/manifest.json) ───

create table if not exists public.digital_stickers (
  id text primary key,
  label text not null,
  src text not null
);

create table if not exists public.physical_locations (
  id text primary key,
  name text not null,
  description text,
  image text,
  active boolean not null default true
);

create table if not exists public.location_sticker_pools (
  location_id text not null references public.physical_locations(id) on delete cascade,
  pool_index int not null check (pool_index >= 0),
  digital_sticker_id text not null references public.digital_stickers(id),
  primary key (location_id, pool_index)
);

insert into public.digital_stickers (id, label, src) values
  ('digital-sticker-1', 'Antwerp Collectible I', '/digitalStickers/digitalSticker1.png'),
  ('digital-sticker-2', 'Antwerp Collectible II', '/digitalStickers/digitalSticker2.png'),
  ('digital-sticker-3', 'Antwerp Collectible III', '/digitalStickers/digitalSticker3.png')
on conflict (id) do update set label = excluded.label, src = excluded.src;

insert into public.physical_locations (id, name, description, image, active) values
  (
    'demo-memome-spot',
    'MemMe Demo Spot — Grote Markt',
    'Scan at the Grote Markt MemMe sticker in Antwerp.',
    '/physicalStickers/physicalSticker.png',
    true
  ),
  (
    'demo-memome-mas',
    'MemMe Demo Spot — MAS Museum',
    'Scan at the MAS Museum MemMe sticker in Antwerp.',
    '/physicalStickers/physicalSticker.png',
    true
  ),
  (
    'demo-memome-station',
    'MemMe Demo Spot — Central Station',
    'Scan at the Central Station MemMe sticker in Antwerp.',
    '/physicalStickers/physicalSticker.png',
    true
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  active = excluded.active;

insert into public.location_sticker_pools (location_id, pool_index, digital_sticker_id) values
  ('demo-memome-spot', 0, 'digital-sticker-1'),
  ('demo-memome-mas', 0, 'digital-sticker-2'),
  ('demo-memome-station', 0, 'digital-sticker-3')
on conflict (location_id, pool_index) do update set digital_sticker_id = excluded.digital_sticker_id;

-- ─── User collections ───

create table if not exists public.user_collected_stickers (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null references auth.users(id) on delete cascade,
  location_id text not null references public.physical_locations(id),
  digital_sticker_id text not null references public.digital_stickers(id),
  claimed_at timestamptz not null default now(),
  unique (auth_id, location_id)
);

create index if not exists user_collected_stickers_auth_idx
  on public.user_collected_stickers (auth_id);

-- Guest claims (device id) until account is created
create table if not exists public.guest_sticker_claims (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null,
  location_id text not null references public.physical_locations(id),
  digital_sticker_id text not null references public.digital_stickers(id),
  claimed_at timestamptz not null default now(),
  unique (device_id, location_id)
);

create index if not exists guest_sticker_claims_device_idx
  on public.guest_sticker_claims (device_id);

-- ─── Deterministic pick (matches app/utils/stickerAssignment.js fnv1a) ───

create or replace function public.pick_pool_sticker(
  p_user_key text,
  p_location_id text,
  p_exclude_ids text[] default '{}'
)
returns text
language plpgsql
stable
as $$
declare
  v_pool text[];
  v_eligible text[];
  v_hash bigint;
  v_idx int;
begin
  select array_agg(digital_sticker_id order by pool_index)
    into v_pool
  from public.location_sticker_pools
  where location_id = p_location_id;

  if v_pool is null or array_length(v_pool, 1) is null then
    return null;
  end if;

  select coalesce(array_agg(digital_sticker_id order by pool_index), v_pool)
    into v_eligible
  from public.location_sticker_pools
  where location_id = p_location_id
    and not (digital_sticker_id = any (p_exclude_ids));

  if v_eligible is null or array_length(v_eligible, 1) is null then
    v_eligible := v_pool;
  end if;

  v_hash := abs(hashtext(p_user_key || ':' || p_location_id));
  v_idx := (v_hash % array_length(v_eligible, 1)) + 1;
  return v_eligible[v_idx];
end;
$$;

-- ─── Claim RPC (security definer — validates location, prevents duplicates) ───

create or replace function public.claim_physical_sticker(
  p_location_id text,
  p_device_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_id uuid := auth.uid();
  v_user_key text;
  v_sticker_id text;
  v_owned text[] := '{}';
  v_existing record;
  v_location record;
begin
  select * into v_location
  from public.physical_locations
  where id = p_location_id and active = true;

  if not found then
    return jsonb_build_object('error', 'unknown_location');
  end if;

  if v_auth_id is not null then
    v_user_key := v_auth_id::text;

    select * into v_existing
    from public.user_collected_stickers
    where auth_id = v_auth_id and location_id = p_location_id;

    if found then
      return jsonb_build_object(
        'alreadyClaimed', true,
        'stickerId', v_existing.digital_sticker_id,
        'locationId', p_location_id,
        'claimedAt', v_existing.claimed_at
      );
    end if;
  else
    if p_device_id is null then
      return jsonb_build_object('error', 'device_required');
    end if;

    v_user_key := p_device_id::text;

    select * into v_existing
    from public.guest_sticker_claims
    where device_id = p_device_id and location_id = p_location_id;

    if found then
      return jsonb_build_object(
        'alreadyClaimed', true,
        'stickerId', v_existing.digital_sticker_id,
        'locationId', p_location_id,
        'claimedAt', v_existing.claimed_at
      );
    end if;
  end if;

  if v_auth_id is not null then
    select coalesce(array_agg(distinct digital_sticker_id), '{}')
      into v_owned
    from public.user_collected_stickers
    where auth_id = v_auth_id;
  else
    select coalesce(array_agg(distinct digital_sticker_id), '{}')
      into v_owned
    from public.guest_sticker_claims
    where device_id = p_device_id;
  end if;

  v_sticker_id := public.pick_pool_sticker(v_user_key, p_location_id, v_owned);
  if v_sticker_id is null then
    return jsonb_build_object('error', 'empty_pool');
  end if;

  if v_auth_id is not null then
    insert into public.user_collected_stickers (auth_id, location_id, digital_sticker_id)
    values (v_auth_id, p_location_id, v_sticker_id);
  else
    insert into public.guest_sticker_claims (device_id, location_id, digital_sticker_id)
    values (p_device_id, p_location_id, v_sticker_id);
  end if;

  return jsonb_build_object(
    'alreadyClaimed', false,
    'stickerId', v_sticker_id,
    'locationId', p_location_id,
    'claimedAt', now()
  );
end;
$$;

-- Move guest claims → user on signup/login
create or replace function public.merge_guest_sticker_claims(p_device_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_id uuid := auth.uid();
  v_merged int := 0;
  r record;
  v_rows int;
begin
  if v_auth_id is null or p_device_id is null then
    return 0;
  end if;

  for r in
    select location_id, digital_sticker_id, claimed_at
    from public.guest_sticker_claims
    where device_id = p_device_id
  loop
    insert into public.user_collected_stickers (auth_id, location_id, digital_sticker_id, claimed_at)
    values (v_auth_id, r.location_id, r.digital_sticker_id, r.claimed_at)
    on conflict (auth_id, location_id) do nothing;

    get diagnostics v_rows = row_count;
    v_merged := v_merged + v_rows;
  end loop;

  delete from public.guest_sticker_claims where device_id = p_device_id;
  return v_merged;
end;
$$;

grant execute on function public.claim_physical_sticker(text, uuid) to anon, authenticated;
grant execute on function public.merge_guest_sticker_claims(uuid) to authenticated;

-- ─── RLS ───

alter table public.digital_stickers enable row level security;
alter table public.physical_locations enable row level security;
alter table public.location_sticker_pools enable row level security;
alter table public.user_collected_stickers enable row level security;
alter table public.guest_sticker_claims enable row level security;

drop policy if exists "digital_stickers_public_read" on public.digital_stickers;
create policy "digital_stickers_public_read"
  on public.digital_stickers for select using (true);

drop policy if exists "physical_locations_public_read" on public.physical_locations;
create policy "physical_locations_public_read"
  on public.physical_locations for select using (active = true);

drop policy if exists "location_pools_public_read" on public.location_sticker_pools;
create policy "location_stickers_public_read"
  on public.location_sticker_pools for select using (true);

drop policy if exists "user_collected_select_own" on public.user_collected_stickers;
create policy "user_collected_select_own"
  on public.user_collected_stickers for select
  using (auth.uid() = auth_id);

drop policy if exists "user_collected_insert_own" on public.user_collected_stickers;
create policy "user_collected_insert_own"
  on public.user_collected_stickers for insert
  with check (auth.uid() = auth_id);

drop policy if exists "user_collected_update_own" on public.user_collected_stickers;
create policy "user_collected_update_own"
  on public.user_collected_stickers for update
  using (auth.uid() = auth_id)
  with check (auth.uid() = auth_id);

-- Inserts for guests go through claim_physical_sticker RPC (security definer).

drop policy if exists "guest_claims_deny_all" on public.guest_sticker_claims;
create policy "guest_claims_deny_all"
  on public.guest_sticker_claims for all using (false);
