import { makeLocalUserBucket } from './localStorageUserBucket';

const STORAGE_KEY = 'memome:location-picker-recents';
const MAX_RECENT = 8;

const { getItems, setItems } = makeLocalUserBucket(STORAGE_KEY);

export function loadLocationPickerRecents(userId) {
  if (typeof window === 'undefined') return [];
  return getItems(userId).filter(
    item => item?.placeId && item?.name && Number.isFinite(item.lat) && Number.isFinite(item.lng),
  );
}

export function addLocationPickerRecent(userId, entry) {
  if (typeof window === 'undefined') return [];
  if (!entry?.placeId || !entry?.name || !Number.isFinite(entry.lat) || !Number.isFinite(entry.lng)) {
    return loadLocationPickerRecents(userId);
  }

  const next = [
    entry,
    ...loadLocationPickerRecents(userId).filter(item => item.placeId !== entry.placeId),
  ].slice(0, MAX_RECENT);

  setItems(userId, next);
  return next;
}
