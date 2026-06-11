import { data, useLoaderData } from 'react-router';
import LocationDetail from '../components/LocationDetail';
import { loadLocationPageClient } from '../utils/locationPage';

export function meta({ data: loaderData }) {
  const name = loaderData?.place?.name ?? 'Location';
  return [
    { title: `MemoMe — ${name}` },
    { name: 'description', content: loaderData?.place?.description ?? 'Explore this spot in Antwerp.' },
  ];
}

export async function clientLoader({ request }) {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get('lat'));
  const lng = Number(url.searchParams.get('lng'));
  const locationName = url.searchParams.get('name') ?? '';

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw data('Missing map coordinates for this place.', { status: 400 });
  }

  return loadLocationPageClient({ lat, lng, locationName });
}

clientLoader.hydrate = true;

export default function LocationLookupPage() {
  const { place, featuredMemos } = useLoaderData();
  return <LocationDetail place={place} featuredMemos={featuredMemos} />;
}
