import {
  addLocalDiscoverFave,
  clearGuestDiscoverFaves,
  clearLocalDiscoverFaves,
  getLocalDiscoverFaves,
  removeLocalDiscoverFave,
} from './localDiscoverFaves';
import { getSupabaseBrowserClient, isSupabaseEnabled } from './supabase.client';
import { withSupabaseOrLocal } from './userCollectionsStoreHelpers';

/** @typedef {'event' | 'place'} DiscoverFaveType */
/** @typedef {{ type: DiscoverFaveType, id: string, savedAt: string }} DiscoverFaveEntry */

function dedupeFaves(entries) {
  const byKey = new Map();
  for (const entry of entries) {
    byKey.set(`${entry.type}:${entry.id}`, entry);
  }
  return [...byKey.values()];
}

function tableForType(type) {
  return type === 'event' ? 'user_saved_events' : 'user_saved_places';
}

function idColumnForType(type) {
  return type === 'event' ? 'event_id' : 'place_id';
}

async function fetchDiscoverFavesFromSupabase(client, accountId) {
  const [eventsRes, placesRes] = await Promise.all([
    client
      .from('user_saved_events')
      .select('event_id, saved_at')
      .eq('auth_id', accountId),
    client
      .from('user_saved_places')
      .select('place_id, saved_at')
      .eq('auth_id', accountId),
  ]);

  if (eventsRes.error || placesRes.error) {
    return { error: eventsRes.error ?? placesRes.error };
  }

  return dedupeFaves([
    ...(eventsRes.data ?? []).map(row => ({
      type: 'event',
      id: row.event_id,
      savedAt: row.saved_at,
    })),
    ...(placesRes.data ?? []).map(row => ({
      type: 'place',
      id: row.place_id,
      savedAt: row.saved_at,
    })),
  ]);
}

export async function fetchDiscoverFaves(authUserId) {
  return withSupabaseOrLocal(
    authUserId,
    async (client, accountId) => fetchDiscoverFavesFromSupabase(client, accountId),
    () => getLocalDiscoverFaves(authUserId),
  );
}

export async function addDiscoverFave(authUserId, entry) {
  const savedAt = entry.savedAt ?? new Date().toISOString();
  const fullEntry = { ...entry, savedAt };

  return withSupabaseOrLocal(
    authUserId,
    async (client, accountId) => {
      const faves = await fetchDiscoverFavesFromSupabase(client, accountId);
      if (faves.error) return { error: faves.error };

      if (faves.some(item => item.type === entry.type && item.id === entry.id)) {
        return { added: false, faves };
      }

      const table = tableForType(entry.type);
      const idColumn = idColumnForType(entry.type);
      const { error } = await client.from(table).insert({
        auth_id: accountId,
        [idColumn]: entry.id,
        saved_at: savedAt,
      });

      if (error) return { error };

      return { added: true, faves: [...faves, fullEntry] };
    },
    () => addLocalDiscoverFave(authUserId, fullEntry),
  );
}

export async function removeDiscoverFave(authUserId, type, id) {
  return withSupabaseOrLocal(
    authUserId,
    async (client, accountId) => {
      const faves = await fetchDiscoverFavesFromSupabase(client, accountId);
      if (faves.error) return { error: faves.error };

      const next = faves.filter(item => !(item.type === type && item.id === id));
      if (next.length === faves.length) {
        return { faves };
      }

      const table = tableForType(type);
      const idColumn = idColumnForType(type);
      const { error } = await client
        .from(table)
        .delete()
        .eq('auth_id', accountId)
        .eq(idColumn, id);

      if (error) return { error };

      return { faves: next };
    },
    () => ({ faves: removeLocalDiscoverFave(authUserId, type, id) }),
  );
}

export async function mergeLocalDiscoverFavesIntoAccount(authUserId) {
  if (!authUserId) return { merged: 0 };

  const client = getSupabaseBrowserClient();
  if (!isSupabaseEnabled() || !client) return { merged: 0 };

  // Guest bucket (pre-login) plus any user-scoped local cache from a prior session.
  const pending = dedupeFaves([
    ...getLocalDiscoverFaves(null),
    ...getLocalDiscoverFaves(authUserId),
  ]);

  if (!pending.length) return { merged: 0 };

  const eventRows = pending
    .filter(item => item.type === 'event')
    .map(item => ({
      auth_id: authUserId,
      event_id: item.id,
      saved_at: item.savedAt,
    }));

  const placeRows = pending
    .filter(item => item.type === 'place')
    .map(item => ({
      auth_id: authUserId,
      place_id: item.id,
      saved_at: item.savedAt,
    }));

  const results = await Promise.all([
    eventRows.length
      ? client.from('user_saved_events').upsert(eventRows, {
        onConflict: 'auth_id,event_id',
        ignoreDuplicates: true,
      })
      : Promise.resolve({ error: null }),
    placeRows.length
      ? client.from('user_saved_places').upsert(placeRows, {
        onConflict: 'auth_id,place_id',
        ignoreDuplicates: true,
      })
      : Promise.resolve({ error: null }),
  ]);

  if (results.some(result => result.error)) {
    return { merged: 0 };
  }

  clearGuestDiscoverFaves();
  clearLocalDiscoverFaves(authUserId);
  return { merged: pending.length };
}

export { clearGuestDiscoverFaves as clearGuestDiscoverFavesCache } from './localDiscoverFaves';
