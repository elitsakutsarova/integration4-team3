-- Add Photon place id for memo locations picked from search (run after memos.sql)
alter table public.memos
  add column if not exists place_id text;

create index if not exists memos_place_id_idx on public.memos (place_id)
  where place_id is not null;
