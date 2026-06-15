-- Remove duplicate rows and ensure one row per user per sticker.
-- Run in Supabase → SQL Editor if duplicates already exist.

delete from public.user_collected_stickers a
using public.user_collected_stickers b
where a.auth_id = b.auth_id
  and a.digital_sticker_id = b.digital_sticker_id
  and a.id > b.id;

create unique index if not exists user_collected_stickers_auth_sticker_uidx
  on public.user_collected_stickers (auth_id, digital_sticker_id);

-- Re-deploy claim_random_sticker from stickers.sql after this migration.
