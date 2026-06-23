/**
 * Photon place detail helpers (browser + server safe).
 */

import { buildPhotonPlaceId } from './placeId';
import { distanceKm } from './memoQueries';
import { paths } from './appPaths';

const PHOTON_REVERSE_URL = 'https://photon.komoot.io/reverse';
const USER_AGENT = 'MemoMe/1.0 (+https://github.com/devine-integration; location detail)';
const PHOTON_TIMEOUT_MS = 2500;

const POI_OSM_KEYS = new Set([
  'amenity', 'shop', 'tourism', 'leisure', 'craft', 'office', 'healthcare',
]);

import {
  ART_VALUES,
  FOOD_VALUES,
  NIGHTLIFE_VALUES,
  resolveLocationCategoryLabel,
} from './locationCategory';

function formatAddress(props) {
  const street = [props.street, props.housenumber].filter(Boolean).join(' ');
  if (street) return street;
  return [props.district, props.city].filter(Boolean).join(', ') || '';
}

function formatTypeLabel(osmKey, osmValue) {
  if (!osmValue) return null;
  const label = osmValue.replace(/_/g, ' ');
  if (osmKey === 'amenity') return label;
  return `${osmKey}: ${label}`;
}

function buildDescription(props) {
  const type = formatTypeLabel(props.osm_key, props.osm_value);
  const area = props.district || props.locality || props.city || 'Antwerp';
  const parts = [];

  if (props.name && type) {
    parts.push(`${props.name} is a ${type} in ${area}.`);
  } else if (props.name) {
    parts.push(`${props.name} is a spot in ${area}.`);
  }

  const street = [props.street, props.housenumber].filter(Boolean).join(' ');
  if (street) parts.push(`Find it on ${street}.`);

  return parts.join(' ') || `A place in ${area}.`;
}

function buildDetails(props) {
  const items = [];
  const typeLabel = formatTypeLabel(props.osm_key, props.osm_value);

  if (typeLabel) {
    const emoji = FOOD_VALUES.has(props.osm_value) ? '☕'
      : NIGHTLIFE_VALUES.has(props.osm_value) ? '🍸'
      : ART_VALUES.has(props.osm_value) ? '🎨'
      : '📌';
    items.push({ emoji, text: typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1) });
  }

  if (props.district || props.locality) {
    items.push({
      emoji: '📍',
      text: `In ${props.district || props.locality}${props.city ? `, ${props.city}` : ''}`,
    });
  }

  if (props.postcode) {
    items.push({ emoji: '📮', text: props.postcode });
  }

  return items;
}

export function photonFeatureToPlaceDetail(feature, fallbackName) {
  const coords = feature.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;

  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const props = feature.properties ?? {};
  const featureName = props.name?.trim() || fallbackName?.trim();
  if (!featureName) return null;

  const osmType = props.osm_type;
  const osmId = props.osm_id;
  if (!osmType || osmId == null) return null;

  return {
    id: buildPhotonPlaceId(osmType, osmId),
    name: featureName,
    lat,
    lng,
    categoryLabel: resolveLocationCategoryLabel(props.osm_key, props.osm_value),
    address: formatAddress(props),
    description: buildDescription(props),
    details: buildDetails(props),
    osmKey: props.osm_key ?? null,
    osmValue: props.osm_value ?? null,
    city: props.city ?? null,
    district: props.district ?? props.locality ?? null,
  };
}

export function featureMatchesPlaceId(feature, placeId) {
  const parsed = placeId?.match(/^photon\/([NWR])\/(\d+)$/);
  if (!parsed) return false;
  const props = feature.properties ?? {};
  return props.osm_type === parsed[1] && String(props.osm_id) === parsed[2];
}

export function isPhotonPoiFeature(props) {
  if (!props?.name?.trim()) return false;
  return POI_OSM_KEYS.has(props.osm_key);
}

function namesMatch(a, b) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

async function fetchReverseFeatures(lat, lng) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
  });

  const response = await fetch(`${PHOTON_REVERSE_URL}?${params}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
    signal: AbortSignal.timeout(PHOTON_TIMEOUT_MS),
  });

  if (!response.ok) return [];

  const payload = await response.json();
  return Array.isArray(payload?.features) ? payload.features : [];
}

async function searchPlacesByName(query) {
  const response = await fetch(`${paths.apiLocationSearch}?q=${encodeURIComponent(query)}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(PHOTON_TIMEOUT_MS),
  });
  if (!response.ok) return [];

  const payload = await response.json();
  return Array.isArray(payload?.places) ? payload.places : [];
}

/** Resolve a named POI (cafe, bar, etc.) at coordinates via Photon. */
export async function resolvePhotonPoiAt({ lat, lng, name }) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  try {
    const features = await fetchReverseFeatures(lat, lng);
    const poiFeatures = features.filter(f => isPhotonPoiFeature(f.properties));

    if (name) {
      const byName = poiFeatures.find(f => namesMatch(f.properties.name, name));
      if (byName) return photonFeatureToPlaceDetail(byName);
    }

    if (poiFeatures.length > 0) {
      return photonFeatureToPlaceDetail(poiFeatures[0]);
    }

    const trimmedName = name?.trim();
    if (trimmedName && trimmedName.length >= 2) {
      const places = await searchPlacesByName(trimmedName);
      const match = places.find(place =>
        namesMatch(place.name, trimmedName)
        && distanceKm(place.lat, place.lng, lat, lng) <= 0.05,
      );
      if (match) {
        return fetchPhotonPlaceDetail({ lat: match.lat, lng: match.lng, placeId: match.id });
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function fetchPhotonPlaceDetail({ lat, lng, placeId, name }) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  try {
    const features = await fetchReverseFeatures(lat, lng);

    if (placeId) {
      const match = features.find(f => featureMatchesPlaceId(f, placeId));
      if (match) return photonFeatureToPlaceDetail(match, name);
    }

    const poi = features.find(f => isPhotonPoiFeature(f.properties));
    if (poi) return photonFeatureToPlaceDetail(poi, name);

    const named = features.find(f => f.properties?.name?.trim());
    if (named) return photonFeatureToPlaceDetail(named, name);

    if (placeId && name?.trim()) {
      const places = await searchPlacesByName(name);
      const match = places.find(place => place.id === placeId);
      if (match) {
        return {
          id: match.id,
          name: match.name ?? name,
          lat: match.lat,
          lng: match.lng,
          categoryLabel: resolveLocationCategoryLabel(match.osmKey, match.category),
          address: match.address ?? '',
          description: `${match.name ?? name} is a spot in Antwerp.`,
          details: [],
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}
