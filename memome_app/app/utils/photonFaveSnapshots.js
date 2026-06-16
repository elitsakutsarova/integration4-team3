const STORAGE_KEY = 'memome:photon-fave-snapshots';

function userKey(userId) {
  return userId ?? 'guest';
}

function readAll() {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeAll(data) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function savePhotonFaveSnapshot(userId, placeId, meta) {
  if (!placeId || !meta?.title) return;

  const all = readAll();
  const key = userKey(userId);
  all[key] = { ...(all[key] ?? {}), [placeId]: meta };
  writeAll(all);
}

export function getPhotonFaveSnapshots(userId) {
  const bucket = readAll()[userKey(userId)];
  return bucket && typeof bucket === 'object' ? bucket : {};
}
