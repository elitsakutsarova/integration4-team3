const STORAGE_KEY = 'memome:recent-place-searches';
const MAX_RECENT = 8;

export function loadRecentSearches() {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(entry) {
  if (!entry?.name || !entry?.placeId) return;

  const next = [
    entry,
    ...loadRecentSearches().filter(item => item.placeId !== entry.placeId),
  ].slice(0, MAX_RECENT);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
