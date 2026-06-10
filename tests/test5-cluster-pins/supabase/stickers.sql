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
  ('digital-sticker-01', 'Antwerp Collectible I', '/digitalStickers/digitalSticker1.png'),
  ('digital-sticker-02', 'Antwerp Collectible II', '/digitalStickers/digitalSticker2.png'),
  ('digital-sticker-03', 'Antwerp Collectible III', '/digitalStickers/digitalSticker3.png'),
  ('digital-sticker-04', 'Antwerp Collectible IV', '/digitalStickers/digitalSticker1.png'),
  ('digital-sticker-05', 'Antwerp Collectible V', '/digitalStickers/digitalSticker2.png'),
  ('digital-sticker-06', 'Antwerp Collectible VI', '/digitalStickers/digitalSticker3.png'),
  ('digital-sticker-07', 'Antwerp Collectible VII', '/digitalStickers/digitalSticker1.png'),
  ('digital-sticker-08', 'Antwerp Collectible VIII', '/digitalStickers/digitalSticker2.png'),
  ('digital-sticker-09', 'Antwerp Collectible IX', '/digitalStickers/digitalSticker3.png'),
  ('digital-sticker-10', 'Antwerp Collectible X', '/digitalStickers/digitalSticker1.png'),
  ('digital-sticker-11', 'Antwerp Collectible XI', '/digitalStickers/digitalSticker2.png'),
  ('digital-sticker-12', 'Antwerp Collectible XII', '/digitalStickers/digitalSticker3.png'),
  ('digital-sticker-13', 'Antwerp Collectible XIII', '/digitalStickers/digitalSticker1.png'),
  ('digital-sticker-14', 'Antwerp Collectible XIV', '/digitalStickers/digitalSticker2.png'),
  ('digital-sticker-15', 'Antwerp Collectible XV', '/digitalStickers/digitalSticker3.png'),
  ('digital-sticker-16', 'Antwerp Collectible XVI', '/digitalStickers/digitalSticker1.png'),
  ('digital-sticker-17', 'Antwerp Collectible XVII', '/digitalStickers/digitalSticker2.png'),
  ('digital-sticker-18', 'Antwerp Collectible XVIII', '/digitalStickers/digitalSticker3.png'),
  ('digital-sticker-19', 'Antwerp Collectible XIX', '/digitalStickers/digitalSticker1.png'),
  ('digital-sticker-20', 'Antwerp Collectible XX', '/digitalStickers/digitalSticker2.png')
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
  v_sticker_id text;
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
  v_sticker_id := v_eligible[v_idx];

  insert into public.user_collected_stickers (auth_id, digital_sticker_id)
  values (v_auth_id, v_sticker_id);

  return jsonb_build_object(
    'stickerId', v_sticker_id,
    'claimedAt', now()
  );
exception
  when unique_violation then
    return jsonb_build_object('error', 'collection_complete');
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
