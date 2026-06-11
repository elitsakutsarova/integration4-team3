import { data } from 'react-router';
import { fetchPhotonPlaceDetail, resolvePhotonPoiAt } from './locationPhoton.server';
import { fetchMemosAtPlace } from './memoQueries';
import { createClient } from './supabase.server';

export async function loadLocationPageData(request, { placeId, lat, lng, locationName }) {
  const place = placeId
    ? await fetchPhotonPlaceDetail({ lat, lng, placeId })
    : await resolvePhotonPoiAt({ lat, lng, name: locationName });

  if (!place) {
    throw data('Place not found', { status: 404 });
  }

  const { supabase, headers } = createClient(request);
  const featuredMemos = await fetchMemosAtPlace(supabase, {
    placeId: place.id,
    lat: place.lat,
    lng: place.lng,
    locationName: place.name,
  });

  return data({ place, featuredMemos }, { headers });
}
