import { getDeviceId } from './deviceId';
import { pickStickerFromPool } from './stickerAssignment';
import {
  addPendingClaim,
  clearPendingClaims,
  getPendingClaims,
  hasPendingLocation,
  removePendingLocation,
} from './pendingStickers';
import { getSupabaseBrowserClient, isSupabaseEnabled } from './supabase.client';

async function loadDigitalCatalogClient() {
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

async function loadLocationsClient() {
  if (typeof window === 'undefined') return [];
  try {
    const res = await fetch('/physicalStickers/locations.json', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getLocation(locationId) {
  const locations = await loadLocationsClient();
  return locations.find(loc => loc.id === locationId && loc.active !== false) ?? null;
}

export async function getAllLocations() {
  const locations = await loadLocationsClient();
  return locations.filter(loc => loc.active !== false);
}

/** Location ids this user/device has already claimed. */
export async function fetchClaimedLocationIds(authUserId) {
  const ids = new Set();
  const accountId = await resolveAccountAuthId(authUserId);

  if (!accountId) {
    for (const pending of getPendingClaims()) {
      ids.add(pending.locationId);
    }
    return [...ids];
  }

  if (isSupabaseEnabled()) {
    const client = getSupabaseBrowserClient();
    if (client) {
      const { data, error } = await client
        .from('user_collected_stickers')
        .select('location_id')
        .eq('auth_id', accountId);

      if (!error && Array.isArray(data)) {
        for (const row of data) ids.add(row.location_id);
      }
    }
  }

  return [...ids];
}

/** Other active spots the user has not claimed yet (for demo / re-scan UX). */
export async function getUnclaimedLocations(authUserId, currentLocationId) {
  const [locations, claimed] = await Promise.all([
    getAllLocations(),
    fetchClaimedLocationIds(authUserId),
  ]);
  const claimedSet = new Set(claimed);
  return locations.filter(
    loc => loc.id !== currentLocationId && !claimedSet.has(loc.id),
  );
}

/** Try to write a claim to the logged-in user's Supabase collection. */
async function persistUserClaim(authUserId, claim) {
  if (!authUserId || !isSupabaseEnabled()) return false;

  const client = getSupabaseBrowserClient();
  if (!client) return false;

  const { error } = await client.from('user_collected_stickers').upsert(
    {
      auth_id: authUserId,
      location_id: claim.locationId,
      digital_sticker_id: claim.digitalStickerId,
      claimed_at: claim.claimedAt,
    },
    { onConflict: 'auth_id,location_id', ignoreDuplicates: true },
  );

  return !error;
}

async function syncClaimToStorage(authUserId, result, locationId) {
  if (!result?.sticker || result.error || result.alreadyClaimed) return true;

  const claim = {
    locationId: result.locationId ?? locationId,
    digitalStickerId: result.sticker.id,
    claimedAt: result.claimedAt ?? new Date().toISOString(),
  };

  if (authUserId) {
    return persistUserClaim(authUserId, claim);
  }

  addPendingClaim(claim);
  return true;
}

/** Prefer Supabase session uuid so RPC auth.uid() matches the account row. */
async function resolveAccountAuthId(hintAuthUserId) {
  if (!isSupabaseEnabled()) return hintAuthUserId ?? null;

  const client = getSupabaseBrowserClient();
  if (!client) return hintAuthUserId ?? null;

  const { data: { session } } = await client.auth.getSession();
  return session?.user?.id ?? hintAuthUserId ?? null;
}

function stickerDefFromCatalog(catalog, stickerId) {
  const row = catalog.find(s => s.id === stickerId);
  if (!row) return null;
  return { id: row.id, src: row.src, label: row.label };
}

async function fetchUserClaimAtLocation(authUserId, locationId) {
  if (!authUserId || !isSupabaseEnabled()) return null;

  const client = getSupabaseBrowserClient();
  if (!client) return null;

  const { data, error } = await client
    .from('user_collected_stickers')
    .select('digital_sticker_id, location_id, claimed_at')
    .eq('auth_id', authUserId)
    .eq('location_id', locationId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

/** Local fallback for guests, or when Supabase location seed is missing. */
async function claimLocally(locationId, userKey, authUserId = null) {
  const location = await getLocation(locationId);
  if (!location) return { error: 'unknown_location' };

  if (authUserId) {
    const existing = await fetchUserClaimAtLocation(authUserId, locationId);
    if (existing) {
      const catalog = await loadDigitalCatalogClient();
      return {
        alreadyClaimed: true,
        sticker: stickerDefFromCatalog(catalog, existing.digital_sticker_id),
        locationId,
        claimedAt: existing.claimed_at,
      };
    }
  } else if (hasPendingLocation(locationId)) {
    const pending = getPendingClaims().find(c => c.locationId === locationId);
    const catalog = await loadDigitalCatalogClient();
    return {
      alreadyClaimed: true,
      sticker: stickerDefFromCatalog(catalog, pending.digitalStickerId),
      locationId,
      claimedAt: pending.claimedAt,
    };
  }

  const stickerId = pickStickerFromPool(
    userKey,
    locationId,
    location.pool,
    await getOwnedStickerIds(authUserId ?? null),
  );
  if (!stickerId) return { error: 'empty_pool' };

  const claim = {
    locationId,
    digitalStickerId: stickerId,
    claimedAt: new Date().toISOString(),
  };

  if (!authUserId) {
    addPendingClaim(claim);
  }

  const catalog = await loadDigitalCatalogClient();
  return {
    alreadyClaimed: false,
    sticker: stickerDefFromCatalog(catalog, stickerId),
    locationId,
    claimedAt: claim.claimedAt,
  };
}

async function claimViaSupabase(locationId, deviceId, authUserId) {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  if (authUserId) {
    const { data: { session } } = await client.auth.getSession();
    if (!session?.user?.id) return null;
  }

  const { data, error } = await client.rpc('claim_physical_sticker', {
    p_location_id: locationId,
    p_device_id: authUserId ? null : deviceId,
  });

  if (error) {
    if (/claim_physical_sticker|function/i.test(error.message ?? '')) {
      return null;
    }
    return { error: error.message };
  }

  const catalog = await loadDigitalCatalogClient();
  const payload = data ?? {};

  if (payload.error) return { error: payload.error };

  return {
    alreadyClaimed: Boolean(payload.alreadyClaimed),
    sticker: stickerDefFromCatalog(catalog, payload.stickerId),
    locationId: payload.locationId ?? locationId,
    claimedAt: payload.claimedAt,
  };
}

/**
 * Claim a sticker at a physical location (guest or logged-in).
 * @param {string} locationId
 * @param {string | null} authUserId — Supabase auth uuid when logged in
 */
export async function claimPhysicalSticker(locationId, authUserId = null) {
  const deviceId = getDeviceId();
  const accountId = await resolveAccountAuthId(authUserId);
  const userKey = accountId ?? deviceId;
  if (!userKey) return { error: 'device_required' };

  let result = null;
  if (isSupabaseEnabled()) {
    result = await claimViaSupabase(locationId, deviceId, accountId);
  }

  // Logged-in users: account collection lives in Supabase only.
  if (accountId && isSupabaseEnabled()) {
    if (!result || result.error === 'unknown_location') {
      const localLoc = await getLocation(locationId);
      if (localLoc) {
        result = await claimLocally(locationId, userKey, accountId);
      }
    }

    if (!result || result.error) {
      return result ?? { error: 'Could not claim sticker. Check your connection and try again.' };
    }

    if (!result.alreadyClaimed) {
      const persisted = await syncClaimToStorage(accountId, result, locationId);
      if (!persisted) {
        return { error: 'Could not save sticker to your account. Try again.' };
      }
    }

    return result;
  }

  // Guest path: localStorage when Supabase RPC/seed is unavailable.
  if (result?.error === 'unknown_location') {
    const localLoc = await getLocation(locationId);
    if (localLoc) {
      result = await claimLocally(locationId, userKey, null);
    }
  }

  if (!result) {
    result = await claimLocally(locationId, userKey, null);
  }

  await syncClaimToStorage(null, result, locationId);

  return result;
}

/** Sticker ids this user/device already owns (for no-repeat assignment). */
export async function getOwnedStickerIds(authUserId) {
  const stickers = await fetchCollectedStickers(authUserId);
  return stickers.map(sticker => sticker.id);
}

/** Fetch collected stickers — Supabase for accounts, localStorage for guests only. */
export async function fetchCollectedStickers(authUserId) {
  const catalog = await loadDigitalCatalogClient();
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
        .select('digital_sticker_id, location_id, claimed_at')
        .eq('auth_id', accountId);

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          addSticker(row.digital_sticker_id, {
            locationId: row.location_id,
            claimedAt: row.claimed_at,
          });
        }
      }
    }

    return [...byId.values()];
  }

  for (const pending of getPendingClaims()) {
    addSticker(pending.digitalStickerId, {
      locationId: pending.locationId,
      claimedAt: pending.claimedAt,
      pending: true,
    });
  }

  return [...byId.values()];
}

/** After login/signup: move guest DB rows + local pending into user account. */
export async function mergeGuestStickersIntoAccount(authUserId) {
  if (!authUserId) return { merged: 0 };

  const deviceId = getDeviceId();
  let merged = 0;

  if (isSupabaseEnabled() && deviceId) {
    const client = getSupabaseBrowserClient();
    if (client) {
      const { data, error } = await client.rpc('merge_guest_sticker_claims', {
        p_device_id: deviceId,
      });
      if (!error && typeof data === 'number') merged += data;
    }
  }

  const pending = getPendingClaims();
  if (pending.length && isSupabaseEnabled()) {
    const client = getSupabaseBrowserClient();
    if (client) {
      for (const claim of pending) {
        const { error } = await client.from('user_collected_stickers').upsert(
          {
            auth_id: authUserId,
            location_id: claim.locationId,
            digital_sticker_id: claim.digitalStickerId,
            claimed_at: claim.claimedAt,
          },
          { onConflict: 'auth_id,location_id', ignoreDuplicates: true },
        );
        if (!error) {
          merged += 1;
          removePendingLocation(claim.locationId);
        }
      }
    }
  }

  return { merged };
}

/** Drop device-local guest queue once stickers belong to an account. */
export function clearGuestStickerCache() {
  clearPendingClaims();
}

export async function getCollectedCount(authUserId) {
  const stickers = await fetchCollectedStickers(authUserId);
  return stickers.length;
}
