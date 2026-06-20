/** Browser-safe helper — resolves location hrefs via the server API. */

import { paths } from './appPaths';

const HREF_FETCH_TIMEOUT_MS = 5000;

export async function fetchLocationHrefFromApi({ placeId, lat, lng, name }) {
  const params = new URLSearchParams({
    placeId: placeId ?? '',
    lat: String(lat ?? ''),
    lng: String(lng ?? ''),
    name: name ?? '',
  });

  try {
    const response = await fetch(`${paths.apiLocationHref}?${params}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(HREF_FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.href ?? null;
  } catch {
    return null;
  }
}
