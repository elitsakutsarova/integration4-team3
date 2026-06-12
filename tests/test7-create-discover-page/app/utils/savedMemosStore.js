import {
  addLocalSavedMemo,
  clearGuestSavedMemos,
  clearLocalSavedMemos,
  getLocalSavedMemos,
  removeLocalSavedMemo,
} from './localSavedMemos';
import { getSupabaseBrowserClient, isSupabaseEnabled } from './supabase.client';
import { withSupabaseOrLocal } from './userCollectionsStoreHelpers';

/** @typedef {{ id: string, savedAt: string }} SavedMemoEntry */

function dedupeMemos(entries) {
  const byId = new Map();
  for (const entry of entries) {
    byId.set(String(entry.id), entry);
  }
  return [...byId.values()];
}

async function fetchSavedMemosFromSupabase(client, accountId) {
  const { data, error } = await client
    .from('user_saved_memos')
    .select('memo_id, saved_at')
    .eq('auth_id', accountId);

  if (error) return { error };

  return (data ?? []).map(row => ({
    id: row.memo_id,
    savedAt: row.saved_at,
  }));
}

export async function fetchSavedMemos(authUserId) {
  return withSupabaseOrLocal(
    authUserId,
    async (client, accountId) => fetchSavedMemosFromSupabase(client, accountId),
    () => getLocalSavedMemos(authUserId),
  );
}

export async function addSavedMemo(authUserId, memoId) {
  const id = String(memoId);

  return withSupabaseOrLocal(
    authUserId,
    async (client, accountId) => {
      const memos = await fetchSavedMemosFromSupabase(client, accountId);
      if (memos.error) return { error: memos.error };

      if (memos.some(item => item.id === id)) {
        return { added: false, memos };
      }

      const savedAt = new Date().toISOString();
      const { error } = await client.from('user_saved_memos').insert({
        auth_id: accountId,
        memo_id: id,
        saved_at: savedAt,
      });

      if (error) return { error };

      return { added: true, memos: [...memos, { id, savedAt }] };
    },
    () => addLocalSavedMemo(authUserId, id),
  );
}

export async function removeSavedMemo(authUserId, memoId) {
  const id = String(memoId);

  return withSupabaseOrLocal(
    authUserId,
    async (client, accountId) => {
      const memos = await fetchSavedMemosFromSupabase(client, accountId);
      if (memos.error) return { error: memos.error };

      const next = memos.filter(item => item.id !== id);
      if (next.length === memos.length) {
        return { memos };
      }

      const { error } = await client
        .from('user_saved_memos')
        .delete()
        .eq('auth_id', accountId)
        .eq('memo_id', id);

      if (error) return { error };

      return { memos: next };
    },
    () => ({ memos: removeLocalSavedMemo(authUserId, id) }),
  );
}

export async function mergeLocalSavedMemosIntoAccount(authUserId) {
  if (!authUserId) return { merged: 0 };

  const client = getSupabaseBrowserClient();
  if (!isSupabaseEnabled() || !client) return { merged: 0 };

  // Guest bucket (pre-login) plus any user-scoped local cache from a prior session.
  const pending = dedupeMemos([
    ...getLocalSavedMemos(null),
    ...getLocalSavedMemos(authUserId),
  ]);

  if (!pending.length) return { merged: 0 };

  const rows = pending.map(item => ({
    auth_id: authUserId,
    memo_id: String(item.id),
    saved_at: item.savedAt,
  }));

  const { error } = await client.from('user_saved_memos').upsert(rows, {
    onConflict: 'auth_id,memo_id',
    ignoreDuplicates: true,
  });

  if (error) return { merged: 0 };

  clearGuestSavedMemos();
  clearLocalSavedMemos(authUserId);
  return { merged: pending.length };
}

export { clearGuestSavedMemos as clearGuestSavedMemosCache } from './localSavedMemos';
