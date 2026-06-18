import { paths } from './appPaths';

const SEARCH_TIMEOUT_MS = 12_000;

export async function fetchLocationSearchClient(query) {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { places: [], error: null };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${paths.apiLocationSearch}?q=${encodeURIComponent(trimmed)}`,
      {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      return {
        places: [],
        error: 'Search temporarily unavailable. Try again.',
      };
    }

    const payload = await response.json();
    return {
      places: Array.isArray(payload?.places) ? payload.places : [],
      error: payload?.error ?? null,
    };
  } catch {
    return {
      places: [],
      error: 'Could not reach search. Check your connection.',
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}
