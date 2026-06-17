-- Sync digital_stickers with public/digitalStickers/manifest.json
-- Run in Supabase → SQL Editor after deploying new sticker assets.

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
