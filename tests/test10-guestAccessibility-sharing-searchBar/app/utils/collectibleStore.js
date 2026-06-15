import {
  addLocalCollected,
  clearLocalCollected,
  getLocalCollected,
  getLocalOwnedStickerIds,
} from './localCollectedStickers';
import { getSupabaseBrowserClient, isSupabaseEnabled } from './supabase.client';
import { resolveAccountAuthId } from './userCollectionsStoreHelpers';

const COLLECTION_COMPLETE = 'collection_complete';

// fetches the list of all possible stickers from manifest.json
export async function loadDigitalStickerCatalog() {
  if (typeof window === 'undefined') return [];
  try {
    const res = await fetch('/digitalStickers/manifest.json', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function stickerDefFromCatalog(catalog, stickerId) {
  const row = catalog.find(sticker => sticker.id === stickerId);
  if (!row) return null;
  return { id: row.id, src: row.src, label: row.label };
}

function pickRandomFromEligible(eligible) {
  if (!eligible.length) return null;
  const index = Math.floor(Math.random() * eligible.length);
  return eligible[index];
}

function normalizeClaimError(errorCode) {
  if (errorCode === COLLECTION_COMPLETE || errorCode === 'collection_complete') {
    return COLLECTION_COMPLETE;
  }
  if (errorCode === 'already_owned') {
    return COLLECTION_COMPLETE;
  }
  return errorCode;
}

// logged-in user calls claimViaSupabase() which asks the database for a random sticker the user doesn’t own yet
async function claimViaSupabase() {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  const { data: { session } } = await client.auth.getSession();
  if (!session?.user?.id) return { error: 'auth_required' };

  const { data, error } = await client.rpc('claim_random_sticker');
  if (error) {
    if (/claim_random_sticker|function/i.test(error.message ?? '')) return null;
    return { error: error.message };
  }

  const payload = data ?? {};
  if (payload.error) return { error: normalizeClaimError(payload.error) };

  const catalog = await loadDigitalStickerCatalog();
  return {
    sticker: stickerDefFromCatalog(catalog, payload.stickerId),
    claimedAt: payload.claimedAt,
  };
}

// for guests
async function claimRandomStickerGuest() {
  const catalog = await loadDigitalStickerCatalog();
  const owned = new Set(getLocalOwnedStickerIds());
  const eligible = catalog.filter(sticker => !owned.has(sticker.id));

  if (eligible.length === 0) return { error: COLLECTION_COMPLETE };

  const pick = pickRandomFromEligible(eligible);
  if (!pick) return { error: COLLECTION_COMPLETE };

  const entry = addLocalCollected(pick.id);
  return {
    sticker: pick,
    claimedAt: entry?.claimedAt ?? new Date().toISOString(),
  };
}

/**
 * Claim one random sticker the user does not own yet.
 * Pass the user from authStore.getSession() so guest vs account is explicit.
 * Logged-in: Supabase RPC. Guest: localStorage only.
 */
export async function claimRandomSticker(sessionUser = null) {
  const accountId = sessionUser?.id ?? null;

  if (accountId && isSupabaseEnabled()) {
    const result = await claimViaSupabase();
    if (result) return result;
    return { error: 'Could not claim sticker. Check your connection and try again.' };
  }

  if (accountId) {
    return { error: 'Could not claim sticker. Check your connection and try again.' };
  }

  return claimRandomStickerGuest();
}

// returns a list of sticker objects; if logged in: fetches from Supabase
// if guest -> reads from localStorafe
export async function fetchCollectedStickers(authUserId) {
  const catalog = await loadDigitalStickerCatalog();
  const byId = new Map();
  const accountId = await resolveAccountAuthId(authUserId);

  function addSticker(stickerId, meta = {}) {
    const def = stickerDefFromCatalog(catalog, stickerId);
    if (def && !byId.has(def.id)) {
      byId.set(def.id, { ...def, ...meta });
    }
  }

  if (accountId && isSupabaseEnabled()) {
    const client = getSupabaseBrowserClient();
    if (client) {
      const { data, error } = await client
        .from('user_collected_stickers')
        .select('digital_sticker_id, claimed_at')
        .eq('auth_id', accountId);

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          addSticker(row.digital_sticker_id, { claimedAt: row.claimed_at });
        }
      }
    }
    return [...byId.values()];
  }

  for (const entry of getLocalCollected()) {
    addSticker(entry.digitalStickerId, {
      claimedAt: entry.claimedAt,
      pending: true,
    });
  }

  return [...byId.values()];
}

/** Move guest localStorage collection into the logged-in account. */
export async function mergeLocalStickersIntoAccount(authUserId) {
  if (!authUserId) return { merged: 0 };

  const localEntries = getLocalCollected();
  if (!localEntries.length) return { merged: 0 };

  const client = getSupabaseBrowserClient();
  if (!isSupabaseEnabled() || !client) return { merged: 0 };

  const rows = localEntries.map(entry => ({
    auth_id: authUserId,
    digital_sticker_id: entry.digitalStickerId,
    claimed_at: entry.claimedAt,
  }));

  const { error } = await client.from('user_collected_stickers').upsert(rows, {
    onConflict: 'auth_id,digital_sticker_id',
    ignoreDuplicates: true,
  });

  if (error) return { merged: 0 };

  clearLocalCollected();
  return { merged: localEntries.length };
}

export function clearGuestStickerCache() {
  clearLocalCollected();
}

export { COLLECTION_COMPLETE };
