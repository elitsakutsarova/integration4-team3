-- Run BEFORE stickers.sql if upgrading from the location-based schema.

drop function if exists public.claim_physical_sticker(text, uuid);
drop function if exists public.merge_guest_sticker_claims(uuid);
drop function if exists public.pick_pool_sticker(text, text, text[]);
drop function if exists public.claim_random_sticker();

drop table if exists public.guest_sticker_claims;
drop table if exists public.location_sticker_pools;
drop table if exists public.user_collected_stickers;
drop table if exists public.physical_locations;
