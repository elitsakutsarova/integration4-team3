-- Run in Supabase → SQL Editor when adding new demo collect spots.
-- Safe to re-run (uses ON CONFLICT).

insert into public.physical_locations (id, name, description, image, active) values
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
  ('demo-memome-mas', 0, 'digital-sticker-1'),
  ('demo-memome-mas', 1, 'digital-sticker-2'),
  ('demo-memome-mas', 2, 'digital-sticker-3'),
  ('demo-memome-station', 0, 'digital-sticker-1'),
  ('demo-memome-station', 1, 'digital-sticker-2'),
  ('demo-memome-station', 2, 'digital-sticker-3')
on conflict (location_id, pool_index) do update set digital_sticker_id = excluded.digital_sticker_id;
