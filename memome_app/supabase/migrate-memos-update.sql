-- Allow signed-in users to update their own memos (run once in Supabase SQL Editor)
drop policy if exists "memos_update_own" on public.memos;

create policy "memos_update_own"
  on public.memos for update
  to authenticated
  using ((select auth.uid()) = auth_id)
  with check ((select auth.uid()) = auth_id);

grant update on public.memos to authenticated;
