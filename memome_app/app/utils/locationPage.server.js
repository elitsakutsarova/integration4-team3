/**
 * Server-side location page loading — faster than client-only Photon + Supabase.
 */

import { redirect } from 'react-router';
import { fallbackPathFromRequest } from './appPaths';
import { resolveLocationCategoryLabel } from './locationCategory';
import { fetchPhotonPlaceDetail } from './locationPhoton';
import { distanceKm, FEATURED_MEMO_LIMIT, fetchMemosAtPlace, MAX_MEMOS_PER_SPOT } from './memoQueries';
import { parseLocationRoute } from './parseLocationRoute';
import { searchAntwerpPlaces } from './locationSearch.server';
import { createClient } from './supabase.server';

function placeFromSearchMatch(match, locationName) {
  const name = match.name?.trim() || locationName?.trim();
  return {
    id: match.id,
    name,
    lat: match.lat,
    lng: match.lng,
    categoryLabel: resolveLocationCategoryLabel(match.osmKey, match.category),
    address: match.address ?? '',
    description: `${name} is a spot in Antwerp.`,
    details: [],
    osmKey: match.osmKey ?? null,
    osmValue: match.category ?? null,
  };
}

async function resolveVerifiedLocationSpotServer(args) {
  const parsed = parseLocationRoute(args);
  const { placeId, lat, lng, locationName } = parsed;

  if (locationName) {
    const { places } = await searchAntwerpPlaces(locationName);
    const match = places.find(
      place => place.id === placeId && distanceKm(place.lat, place.lng, lat, lng) <= 0.05,
    );
    if (match) {
      return {
        place: placeFromSearchMatch(match, locationName),
        placeId,
        lat: match.lat,
        lng: match.lng,
        locationName: locationName.trim() || match.name,
      };
    }
  }

  const place = await fetchPhotonPlaceDetail({ lat, lng, placeId, name: locationName });
  if (!place || place.id !== placeId) {
    throw redirect(fallbackPathFromRequest(args.request));
  }

  return {
    place,
    placeId,
    lat: place.lat,
    lng: place.lng,
    locationName: locationName.trim() || place.name,
  };
}

async function fetchSpotMemosServer(supabase, { placeId, lat, lng, locationName }) {
  const archiveMemos = await fetchMemosAtPlace(
    supabase,
    { placeId, lat, lng, locationName },
    { limit: MAX_MEMOS_PER_SPOT },
  );

  return {
    featuredMemos: archiveMemos.slice(0, FEATURED_MEMO_LIMIT),
    totalMemoCount: archiveMemos.length,
  };
}

export async function loadLocationPageServer(args) {
  const { request } = args;
  const verified = await resolveVerifiedLocationSpotServer(args);
  const { supabase } = createClient(request);
  const { featuredMemos, totalMemoCount } = await fetchSpotMemosServer(supabase, verified);

  return {
    place: verified.place,
    featuredMemos,
    totalMemoCount,
    imageUrl: null,
  };
}
