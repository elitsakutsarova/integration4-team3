// utility function to load the location page client

import { redirect } from 'react-router';
import { bootstrapAuthSession } from './authSession';
import { fetchPhotonPlaceDetail } from './locationPhoton';
import { parseLocationRoute } from './parseLocationRoute';
import { loadSpotMemos } from './loadSpotMemos';
import { fallbackPathFromRequest } from './appPaths';

/** Reject fabricated /location URLs — coords must be in Antwerp and match a real OSM place.
 *  Bounds are already verified by parseLocationRoute; we verify Photon confirms the place ID. */
export async function resolveVerifiedLocationSpot(args) {
  const parsed = parseLocationRoute(args);
  const { placeId, lat, lng, locationName, spotTitle } = parsed;

  const place = await fetchPhotonPlaceDetail({ lat, lng, placeId });
  if (!place || place.id !== placeId) {
    throw redirect(fallbackPathFromRequest(args.request));
  }

  return {
    place,
    placeId,
    lat: place.lat,
    lng: place.lng,
    locationName: locationName.trim() || place.name,
    spotTitle: spotTitle.trim() || place.name,
  };
}

export async function loadLocationPageClient(args) {
  await bootstrapAuthSession();

  const { place, placeId, lat, lng, locationName } = await resolveVerifiedLocationSpot(args);
  const { featuredMemos, totalMemoCount } = await loadSpotMemos({
    placeId,
    lat,
    lng,
    locationName,
  });

  return { place, featuredMemos, totalMemoCount };
}

export async function loadLocationMemosClient(args) {
  await bootstrapAuthSession();

  const { placeId, lat, lng, locationName, spotTitle } = await resolveVerifiedLocationSpot(args);
  const { archiveMemos, totalMemoCount } = await loadSpotMemos({
    placeId,
    lat,
    lng,
    locationName,
  });

  return {
    spotTitle,
    locationName,
    memos: archiveMemos,
    memoCount: totalMemoCount,
  };
}
