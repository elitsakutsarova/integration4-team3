// utility function to load the location page client

import { bootstrapAuthSession } from './authSession';
import { buildPlaceStub } from './locationPhoton';
import { loadSpotMemos } from './loadSpotMemos';

export async function loadLocationPageClient({ placeId, lat, lng, locationName }) {
  await bootstrapAuthSession();

  const place = buildPlaceStub({ placeId, lat, lng, name: locationName });
  const { featuredMemos, totalMemoCount } = await loadSpotMemos({
    placeId: placeId ?? place.id,
    lat,
    lng,
    locationName: locationName || place.name,
  });

  return { place, featuredMemos, totalMemoCount };
}
