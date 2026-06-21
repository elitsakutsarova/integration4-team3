import {
  getAllDiscoverEvents,
  getAllDiscoverPlaces,
  getDiscoverPlaceById,
} from '../data/discoverDetails';
import { discoverEventPath, discoverPlacePath } from './appPaths';
import { buildLocationDetailHref } from './locationHref';

const SEARCH_SUGGESTIONS = ['Festival', 'Grote Markt', 'Club Vaag'];
const NO_RESULTS_SUGGESTIONS = ['Festival', 'Grote Markt', 'Cafe'];
const DEFAULT_SPOT_IMAGE = '/discover/caffe-mundi.jpg';

function uniqueDiscoverPlaces() {
  const seen = new Set();

  return getAllDiscoverPlaces().filter(place => {
    const full = getDiscoverPlaceById(place.id);
    const baseId = full?.id ?? place.id;
    if (seen.has(baseId)) return false;
    seen.add(baseId);
    return true;
  });
}

function matchesTitle(value, query) {
  return String(value).toLowerCase().includes(query);
}

function discoverPlaceToSpot(place) {
  const full = getDiscoverPlaceById(place.id);
  if (!full) return null;

  const lat = full.ll?.[0];
  const lng = full.ll?.[1];
  const locationHref = full.placeId && Number.isFinite(lat) && Number.isFinite(lng)
    ? buildLocationDetailHref({
      placeId: full.placeId,
      lat,
      lng,
      name: full.title,
    })
    : null;

  return {
    id: full.id,
    title: full.title,
    location: full.location,
    tags: full.tags ?? [],
    categories: full.categories ?? [],
    image: full.image ?? DEFAULT_SPOT_IMAGE,
    href: locationHref ?? discoverPlacePath(full.id),
    faveId: full.id,
    recentId: full.placeId ?? `discover/${full.id}`,
    recentName: full.title,
    recentAddress: full.mapsQuery || `${full.location}, Antwerpen`,
  };
}

function photonPlaceToSpot(place) {
  const href = buildLocationDetailHref({
    placeId: place.id,
    lat: place.lat,
    lng: place.lng,
    name: place.name,
  });

  if (!href) return null;

  return {
    id: place.id,
    title: place.name,
    location: place.address || 'Antwerpen, Belgium',
    tags: [formatPhotonTag(place.category)],
    image: DEFAULT_SPOT_IMAGE,
    href,
    faveId: place.id,
    recentId: place.id,
    recentName: place.name,
    recentAddress: place.address || 'Antwerpen, Belgium',
  };
}

function formatPhotonTag(category) {
  if (!category) return 'Place';
  return String(category).charAt(0).toUpperCase() + String(category).slice(1);
}

export function getSearchSuggestions() {
  return SEARCH_SUGGESTIONS;
}

export function getNoResultsSuggestions() {
  return NO_RESULTS_SUGGESTIONS;
}

export function searchResponseMatchesQuery(data, query) {
  const responseQuery = data?.query?.trim().toLowerCase() ?? '';
  const activeQuery = query.trim().toLowerCase();
  if (!responseQuery || !activeQuery) return false;
  return responseQuery === activeQuery;
}

export function getSearchFetchState({ showResults, trimmedQuery, fetcherState, fetcherData }) {
  if (!showResults) {
    return {
      hasMatchingResponse: false,
      isAwaitingResults: false,
      photonPlaces: [],
      searchError: null,
    };
  }

  const hasMatchingResponse = fetcherState === 'idle'
    && searchResponseMatchesQuery(fetcherData, trimmedQuery)
    && Array.isArray(fetcherData?.places);

  return {
    hasMatchingResponse,
    isAwaitingResults: fetcherState !== 'idle' || !hasMatchingResponse,
    photonPlaces: hasMatchingResponse ? fetcherData.places : [],
    searchError: hasMatchingResponse ? fetcherData?.error ?? null : null,
  };
}

export function searchDiscoverSpots(query) {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];

  return uniqueDiscoverPlaces()
    .filter(place => matchesTitle(place.title, trimmed))
    .map(discoverPlaceToSpot)
    .filter(Boolean);
}

export function searchDiscoverEvents(query) {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];

  return getAllDiscoverEvents().filter(event =>
    matchesTitle(event.title, trimmed) || matchesTitle(event.location, trimmed),
  );
}

export function searchPhotonSpots(photonPlaces, query) {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];

  return photonPlaces
    .filter(place => matchesTitle(place.name, trimmed))
    .map(photonPlaceToSpot)
    .filter(Boolean);
}

export function mergeSpotResults(discoverSpots, photonSpots) {
  const seen = new Set();
  const merged = [];

  for (const spot of [...discoverSpots, ...photonSpots]) {
    const key = spot.title.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(spot);
  }

  return merged;
}

export function buildGroupedSearchResults(query, photonPlaces = []) {
  const discoverSpots = searchDiscoverSpots(query);
  const photonSpots = searchPhotonSpots(photonPlaces, query);
  const spots = mergeSpotResults(discoverSpots, photonSpots);
  const events = searchDiscoverEvents(query);

  return {
    spots,
    events,
    total: spots.length + events.length,
  };
}

export function spotToRecentEntry(spot) {
  return {
    id: spot.recentId,
    placeId: spot.recentId,
    name: spot.recentName,
    address: spot.recentAddress,
    href: spot.href,
  };
}

export function eventToRecentEntry(event) {
  const href = discoverEventPath(event.id);
  return {
    id: `event/${event.id}`,
    placeId: `event/${event.id}`,
    name: event.title,
    address: event.location,
    href,
  };
}

export function queryToRecentEntry(query) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return null;

  const key = trimmed.toLowerCase();

  return {
    id: `query/${key}`,
    placeId: `query/${key}`,
    name: trimmed,
    address: 'Search again',
    query: trimmed,
  };
}
