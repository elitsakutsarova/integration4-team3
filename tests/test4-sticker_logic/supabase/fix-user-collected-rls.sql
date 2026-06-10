-- Run if account sticker upserts fail silently (missing UPDATE policy).
drop policy if exists "user_collected_update_own" on public.user_collected_stickers;
create policy "user_collected_update_own"
  on public.user_collected_stickers for update
  using (auth.uid() = auth_id)
  with check (auth.uid() = auth_id);
