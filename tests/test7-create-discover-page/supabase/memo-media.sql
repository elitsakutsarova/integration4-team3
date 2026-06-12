-- MemMe: public storage for memo photos and videos (max 10 MB enforced in app)
-- Run once in Supabase → SQL Editor (after memos.sql)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memo-media',
  'memo-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "memo_media_public_read" on storage.objects;
drop policy if exists "memo_media_auth_insert" on storage.objects;

create policy "memo_media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'memo-media');

create policy "memo_media_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'memo-media'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
