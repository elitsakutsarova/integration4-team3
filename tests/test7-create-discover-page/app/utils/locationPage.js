import { bootstrapAuthSession } from './authSession';
import { buildPlaceStub } from './locationPhoton';
import { fetchMemosAtPlace } from './memoQueries';
import { getSupabaseBrowserClient } from './supabase.client';

export async function loadLocationPageClient({ placeId, lat, lng, locationName }) {
  await bootstrapAuthSession();

  const place = buildPlaceStub({ placeId, lat, lng, name: locationName });
  const client = getSupabaseBrowserClient();
  const featuredMemos = await fetchMemosAtPlace(client, {
    placeId: placeId ?? place.id,
    lat,
    lng,
    locationName: locationName || place.name,
  });

  return { place, featuredMemos };
}
