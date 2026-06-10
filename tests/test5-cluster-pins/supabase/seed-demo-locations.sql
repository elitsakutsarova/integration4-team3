-- Run in Supabase → SQL Editor when adding new demo collect spots.
-- Safe to re-run (uses ON CONFLICT).

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

delete from public.location_sticker_pools
where location_id in ('demo-memome-spot', 'demo-memome-mas', 'demo-memome-station')
  and pool_index > 0;

insert into public.location_sticker_pools (location_id, pool_index, digital_sticker_id) values
  ('demo-memome-spot', 0, 'digital-sticker-1'),
  ('demo-memome-mas', 0, 'digital-sticker-2'),
  ('demo-memome-station', 0, 'digital-sticker-3')
on conflict (location_id, pool_index) do update set digital_sticker_id = excluded.digital_sticker_id;
