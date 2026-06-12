// route for the location detail page 

import { useLoaderData } from 'react-router';
import LocationDetail from '../components/LocationDetail';
import { loadLocationPageClient } from '../utils/locationPage';
import { parseLocationRoute } from '../utils/parseLocationRoute';

export function meta({ data: loaderData }) {
  const name = loaderData?.place?.name ?? 'Location';
  return [
    { title: `MemoMe — ${name}` },
    { name: 'description', content: loaderData?.place?.description ?? 'Explore this spot in Antwerp.' },
  ];
}

export async function clientLoader(args) {
  const { placeId, lat, lng, locationName } = parseLocationRoute(args);
  return loadLocationPageClient({ placeId, lat, lng, locationName });
}

clientLoader.hydrate = true;

export default function LocationPage() {
  const { place, featuredMemos, totalMemoCount } = useLoaderData();
  return (
    <LocationDetail
      place={place}
      featuredMemos={featuredMemos}
      totalMemoCount={totalMemoCount}
    />
  );
}
