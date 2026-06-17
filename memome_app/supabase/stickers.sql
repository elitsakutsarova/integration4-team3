-- MemMe: random digital collectible stickers (no physical locations)
-- Run once in Supabase → SQL Editor (after users.sql)

create table if not exists public.digital_stickers (
  id text primary key,
  label text not null,
  src text not null
);

create table if not exists public.user_collected_stickers (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null references auth.users(id) on delete cascade,
  digital_sticker_id text not null references public.digital_stickers(id),
  claimed_at timestamptz not null default now(),
  unique (auth_id, digital_sticker_id)
);

create index if not exists user_collected_stickers_auth_idx
  on public.user_collected_stickers (auth_id);

insert into public.digital_stickers (id, label, src) values
  ('digital-sticker-01', 'Collectible 1', '/digitalStickers/sticker1.svg'),
  ('digital-sticker-02', 'Collectible 2', '/digitalStickers/sticker2.svg'),
  ('digital-sticker-03', 'Collectible 3', '/digitalStickers/sticker3.svg'),
  ('digital-sticker-04', 'Collectible 4', '/digitalStickers/sticker4.svg'),
  ('digital-sticker-05', 'Collectible 5', '/digitalStickers/sticker5.svg'),
  ('digital-sticker-06', 'Collectible 6', '/digitalStickers/sticker6.svg'),
  ('digital-sticker-07', 'Collectible 7', '/digitalStickers/sticker7.svg'),
  ('digital-sticker-08', 'Collectible 8', '/digitalStickers/sticker8.svg'),
  ('digital-sticker-09', 'Collectible 9', '/digitalStickers/sticker9.svg'),
  ('digital-sticker-10', 'Collectible 10', '/digitalStickers/sticker10.svg'),
  ('digital-sticker-11', 'Collectible 11', '/digitalStickers/sticker11.svg'),
  ('digital-sticker-12', 'Collectible 12', '/digitalStickers/sticker12.svg'),
  ('digital-sticker-13', 'Collectible 13', '/digitalStickers/sticker13.svg'),
  ('digital-sticker-14', 'Collectible 14', '/digitalStickers/sticker14.svg'),
  ('digital-sticker-15', 'Collectible 15', '/digitalStickers/sticker15.svg'),
  ('digital-sticker-16', 'Collectible 16', '/digitalStickers/sticker16.svg'),
  ('digital-sticker-17', 'Collectible 17', '/digitalStickers/sticker17.svg'),
  ('digital-sticker-18', 'Collectible 18', '/digitalStickers/sticker18.svg'),
  ('digital-sticker-19', 'Collectible 21', '/digitalStickers/sticker21.svg'),
  ('digital-sticker-20', 'Collectible 22', '/digitalStickers/sticker22.svg'),
  ('digital-sticker-21', 'Collectible 23', '/digitalStickers/sticker23.svg'),
  ('digital-sticker-22', 'Collectible 24', '/digitalStickers/sticker24.svg'),
  ('digital-sticker-23', 'Collectible 25', '/digitalStickers/sticker25.svg')
on conflict (id) do update set label = excluded.label, src = excluded.src;

-- Pick a random sticker the user does not own yet (Option B)
create or replace function public.claim_random_sticker()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_id uuid := auth.uid();
  v_owned text[];
  v_eligible text[];
  v_pick text;
  v_inserted text;
  v_idx int;
begin
  if v_auth_id is null then
    return jsonb_build_object('error', 'auth_required');
  end if;

  select coalesce(array_agg(digital_sticker_id), '{}')
    into v_owned
  from public.user_collected_stickers
  where auth_id = v_auth_id;

  select array_agg(id order by id)
    into v_eligible
  from public.digital_stickers
  where not (id = any (v_owned));

  if v_eligible is null or array_length(v_eligible, 1) is null then
    return jsonb_build_object('error', 'collection_complete');
  end if;

  v_idx := 1 + floor(random() * array_length(v_eligible, 1))::int;
  v_pick := v_eligible[v_idx];

  insert into public.user_collected_stickers (auth_id, digital_sticker_id)
  values (v_auth_id, v_pick)
  on conflict (auth_id, digital_sticker_id) do nothing
  returning digital_sticker_id into v_inserted;

  if v_inserted is null then
    return jsonb_build_object('error', 'already_owned');
  end if;

  return jsonb_build_object(
    'stickerId', v_inserted,
    'claimedAt', now()
  );
end;
$$;

grant execute on function public.claim_random_sticker() to authenticated;

alter table public.digital_stickers enable row level security;
alter table public.user_collected_stickers enable row level security;

drop policy if exists "digital_stickers_public_read" on public.digital_stickers;
create policy "digital_stickers_public_read"
  on public.digital_stickers for select using (true);

drop policy if exists "user_collected_select_own" on public.user_collected_stickers;
create policy "user_collected_select_own"
  on public.user_collected_stickers for select
  using (auth.uid() = auth_id);

drop policy if exists "user_collected_insert_own" on public.user_collected_stickers;
create policy "user_collected_insert_own"
  on public.user_collected_stickers for insert
  with check (auth.uid() = auth_id);
