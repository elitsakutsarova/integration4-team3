/**
 * Server-side place search for Antwerp (Photon geocoder — OSM data).
 *
 * Photon (Komoot) is used via our proxy with caching + rate limiting.
 * Map tiles use separate OSM/OpenFreeMap attribution in mapLayers.js.
 */

// why server side?
// 1. rate limiting with shared state
// 2. every user needs their own empty cache
// 3. User-Agent spoofing isn't possible from browsers, and this is is a photon fair-use policy requirement

const DEFAULT_PHOTON_URL = 'https://photon.komoot.io/api/';
const USER_AGENT = 'MemoMe/1.0 (+https://github.com/devine-integration; memo location search)';

const ANTWERP_CENTER = { lat: 51.2194, lng: 4.4025 };
const ANTWERP_BBOX = '4.15,51.05,4.65,51.40';

const MIN_REQUEST_INTERVAL_MS = 1000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 200;

/** @type {Map<string, { result: { places: unknown[]; error?: string }; at: number }>} */
const queryCache = new Map();
let lastUpstreamRequestAt = 0;

function photonBaseUrl() {
  if (typeof process !== 'undefined' && process.env?.PHOTON_API_URL) {
    return process.env.PHOTON_API_URL;
  }
  return DEFAULT_PHOTON_URL;
}

import { clampText, LIMITS } from './validators';

function prepareSearchQuery(raw) {
  const trimmed = clampText(raw, LIMITS.searchQuery);
  if (trimmed.length < 2) return null;
  return {
    cacheKey: trimmed.toLowerCase(),
    photonQuery: trimmed,
  };
}

function readCache(cacheKey) {
  const entry = queryCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    queryCache.delete(key);
    return null;
  }
  return entry.result;
}

function writeCache(cacheKey, result) {
  if (queryCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = queryCache.keys().next().value;
    if (oldest) queryCache.delete(oldest);
  }
  queryCache.set(cacheKey, { result, at: Date.now() });
}

async function waitForRateLimit() {
  const elapsed = Date.now() - lastUpstreamRequestAt;
  const wait = MIN_REQUEST_INTERVAL_MS - elapsed;
  if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
  lastUpstreamRequestAt = Date.now();
}

function inAntwerpBounds(lat, lng) {
  return lat >= 51.05 && lat <= 51.40 && lng >= 4.15 && lng <= 4.65;
}

function formatPhotonAddress(props) {
  const streetLine = [props.housenumber, props.street].filter(Boolean).join(' ').trim();
  const cityLine = [props.postcode, props.city || props.locality].filter(Boolean).join(' ').trim();
  const parts = [streetLine, cityLine].filter(part => part.length > 0);
  if (parts.length > 0) return parts.join(', ');
  return 'Antwerpen, Belgium';
}

function photonToPlace(feature) {
  const coords = feature.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;

  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const props = feature.properties ?? {};
  const name = props.name?.trim();
  if (!name) return null;

  return {
    id: `photon/${props.osm_type}/${props.osm_id}`,
    name,
    lat,
    lng,
    address: formatPhotonAddress(props),
    category: props.osm_value || props.type || 'place',
  };
}

export async function searchAntwerpPlaces(query) {
  const prepared = prepareSearchQuery(query);
  if (!prepared) return { places: [] };

  const cached = readCache(prepared.cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    q: prepared.photonQuery,
    limit: '20',
    lat: String(ANTWERP_CENTER.lat),
    lon: String(ANTWERP_CENTER.lng),
    bbox: ANTWERP_BBOX,
  });

  try {
    await waitForRateLimit();

    const response = await fetch(`${photonBaseUrl()}?${params}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      const result = {
        places: [],
        error: 'Place search is temporarily unavailable. Tap the map to pin a custom spot.',
      };
      return result;
    }

    const data = await response.json();
    const features = Array.isArray(data?.features) ? data.features : [];

    const result = {
      places: features
        .map(photonToPlace)
        .filter(place => place && inAntwerpBounds(place.lat, place.lng))
        .slice(0, 15),
    };

    writeCache(prepared.cacheKey, result);
    return result;
  } catch {
    return {
      places: [],
      error: 'Place search is temporarily unavailable. Tap the map to pin a custom spot.',
    };
  }
}
