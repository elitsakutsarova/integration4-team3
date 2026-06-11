import { data, useLoaderData } from 'react-router';
import LocationDetail from '../components/LocationDetail';
import { loadLocationPageData } from '../utils/locationPage.server';

export function meta({ data: loaderData }) {
  const name = loaderData?.place?.name ?? 'Location';
  return [
    { title: `MemoMe — ${name}` },
    { name: 'description', content: loaderData?.place?.description ?? 'Explore this spot in Antwerp.' },
  ];
}

export async function loader({ request }) {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get('lat'));
  const lng = Number(url.searchParams.get('lng'));
  const locationName = url.searchParams.get('name') ?? '';

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw data('Missing map coordinates for this place.', { status: 400 });
  }

  return loadLocationPageData(request, { lat, lng, locationName });
}

export default function LocationLookupPage() {
  const { place, featuredMemos } = useLoaderData();
  return <LocationDetail place={place} featuredMemos={featuredMemos} />;
}
