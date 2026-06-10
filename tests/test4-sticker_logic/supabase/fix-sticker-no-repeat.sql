-- Patch: no-repeat sticker assignment + demo location pools (one sticker per spot).
-- Run in Supabase → SQL Editor if stickers.sql was already applied.

-- Ensure catalog + locations exist before pools (FK: location_sticker_pools → physical_locations)
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

-- Remove old multi-sticker demo pools (optional cleanup)
delete from public.location_sticker_pools
where location_id in ('demo-memome-spot', 'demo-memome-mas', 'demo-memome-station')
  and pool_index > 0;

insert into public.location_sticker_pools (location_id, pool_index, digital_sticker_id) values
  ('demo-memome-spot', 0, 'digital-sticker-1'),
  ('demo-memome-mas', 0, 'digital-sticker-2'),
  ('demo-memome-station', 0, 'digital-sticker-3')
on conflict (location_id, pool_index) do update set digital_sticker_id = excluded.digital_sticker_id;

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

grant execute on function public.claim_physical_sticker(text, uuid) to anon, authenticated;
