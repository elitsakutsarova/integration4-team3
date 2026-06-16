import { makeLocalUserBucket } from './localStorageUserBucket';

const STORAGE_KEY = 'memome:recent-place-searches';
const MAX_RECENT = 8;

const { getItems, setItems } = makeLocalUserBucket(STORAGE_KEY);

function migrateLegacyFlatList() {
  if (typeof window === 'undefined') return;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ guest: parsed }));
  } catch {
    /* ignore corrupt storage */
  }
}

export function loadRecentSearches(userId) {
  if (typeof window === 'undefined') return [];

  migrateLegacyFlatList();
  return getItems(userId);
}

export function addRecentSearch(userId, entry) {
  if (typeof window === 'undefined') return [];
  if (!entry?.name || !entry?.placeId) return loadRecentSearches(userId);

  const next = [
    entry,
    ...loadRecentSearches(userId).filter(item => item.placeId !== entry.placeId),
  ].slice(0, MAX_RECENT);

  setItems(userId, next);
  return next;
}
