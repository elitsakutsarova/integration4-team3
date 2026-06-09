import { getDeviceId } from './deviceId';
import { pickStickerFromPool } from './stickerAssignment';
import {
  addPendingClaim,
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

  for (const pending of getPendingClaims()) {
    ids.add(pending.locationId);
  }

  if (authUserId && isSupabaseEnabled()) {
    const client = getSupabaseBrowserClient();
    if (client) {
      const { data, error } = await client
        .from('user_collected_stickers')
        .select('location_id')
        .eq('auth_id', authUserId);

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
  if (!result?.sticker || result.error || result.alreadyClaimed) return;

  const claim = {
    locationId: result.locationId ?? locationId,
    digitalStickerId: result.sticker.id,
    claimedAt: result.claimedAt ?? new Date().toISOString(),
  };

  addPendingClaim(claim);

  if (authUserId) {
    const persisted = await persistUserClaim(authUserId, claim);
    if (persisted) removePendingLocation(claim.locationId);
  }
}

function stickerDefFromCatalog(catalog, stickerId) {
  const row = catalog.find(s => s.id === stickerId);
  if (!row) return null;
  return { id: row.id, src: row.src, label: row.label };
}

/** Local fallback when Supabase RPC is unavailable (dev / SQL not run yet). */
async function claimLocally(locationId, userKey) {
  const location = await getLocation(locationId);
  if (!location) return { error: 'unknown_location' };

  if (hasPendingLocation(locationId)) {
    const pending = getPendingClaims().find(c => c.locationId === locationId);
    const catalog = await loadDigitalCatalogClient();
    return {
      alreadyClaimed: true,
      sticker: stickerDefFromCatalog(catalog, pending.digitalStickerId),
      locationId,
      claimedAt: pending.claimedAt,
    };
  }

  const stickerId = pickStickerFromPool(userKey, locationId, location.pool);
  if (!stickerId) return { error: 'empty_pool' };

  const claim = {
    locationId,
    digitalStickerId: stickerId,
    claimedAt: new Date().toISOString(),
  };
  addPendingClaim(claim);

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
  const userKey = authUserId ?? deviceId;
  if (!userKey) return { error: 'device_required' };

  let result = null;
  if (isSupabaseEnabled()) {
    result = await claimViaSupabase(locationId, deviceId, authUserId);
  }

  // DB seed may lag behind public/physicalStickers/locations.json
  if (result?.error === 'unknown_location') {
    const localLoc = await getLocation(locationId);
    if (localLoc) {
      result = await claimLocally(locationId, userKey);
    }
  }

  if (!result) {
    result = await claimLocally(locationId, userKey);
  }

  await syncClaimToStorage(authUserId, result, locationId);

  return result;
}

/** Fetch collected stickers for logged-in user from DB + merge pending for guests. */
export async function fetchCollectedStickers(authUserId) {
  const catalog = await loadDigitalCatalogClient();
  const byId = new Map();

  function addSticker(stickerId, meta = {}) {
    const def = stickerDefFromCatalog(catalog, stickerId);
    if (def && !byId.has(def.id)) {
      byId.set(def.id, { ...def, ...meta });
    }
  }

  if (authUserId && isSupabaseEnabled()) {
    const client = getSupabaseBrowserClient();
    if (client) {
      const { data, error } = await client
        .from('user_collected_stickers')
        .select('digital_sticker_id, location_id, claimed_at')
        .eq('auth_id', authUserId);

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          addSticker(row.digital_sticker_id, {
            locationId: row.location_id,
            claimedAt: row.claimed_at,
          });
        }
      }
    }
  }

  for (const pending of getPendingClaims()) {
    addSticker(pending.digitalStickerId, {
      locationId: pending.locationId,
      claimedAt: pending.claimedAt,
      pending: !authUserId,
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

export async function getCollectedCount(authUserId) {
  const stickers = await fetchCollectedStickers(authUserId);
  return stickers.length;
}
