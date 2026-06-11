import { data, useLoaderData } from 'react-router';
import LocationDetail from '../components/LocationDetail';
import { loadLocationPageData } from '../utils/locationPage.server';
import { buildPhotonPlaceId } from '../utils/placeId';

export function meta({ data: loaderData }) {
  const name = loaderData?.place?.name ?? 'Location';
  return [
    { title: `MemoMe — ${name}` },
    { name: 'description', content: loaderData?.place?.description ?? 'Explore this spot in Antwerp.' },
  ];
}

export async function loader({ params, request }) {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get('lat'));
  const lng = Number(url.searchParams.get('lng'));
  const placeId = buildPhotonPlaceId(params.osmType, params.osmId);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw data('Missing map coordinates for this place.', { status: 400 });
  }

  return loadLocationPageData(request, { placeId, lat, lng, locationName: '' });
}

export default function LocationPage() {
  const { place, featuredMemos } = useLoaderData();
  return <LocationDetail place={place} featuredMemos={featuredMemos} />;
}
