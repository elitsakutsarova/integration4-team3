// route for the location detail page 

import '../styles/modules/bottom-nav.css';
import '../styles/modules/location-detail.css';
import '../styles/modules/discover.css';
import '../styles/modules/diary.css';
import { useLoaderData } from 'react-router';
import AuthLoading from '../components/auth/AuthLoading';
import LocationDetail from '../components/LocationDetail';
import { loadLocationPageClient } from '../utils/locationPage';

export function meta({ data: loaderData }) {
  const name = loaderData?.place?.name ?? 'Location';
  return [
    { title: `MemoMe — ${name}` },
    { name: 'description', content: loaderData?.place?.description ?? 'Explore this spot in Antwerp.' },
  ];
}

export async function clientLoader(args) {
  return loadLocationPageClient(args);
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return <AuthLoading />;
}

export function shouldRevalidate({ currentParams, nextParams }) {
  return currentParams.osmType !== nextParams.osmType || currentParams.osmId !== nextParams.osmId;
}

export default function LocationPage() {
  const { place, featuredMemos, totalMemoCount, imageUrl } = useLoaderData();
  return (
    <LocationDetail
      place={place}
      featuredMemos={featuredMemos}
      totalMemoCount={totalMemoCount}
      imageUrl={imageUrl}
    />
  );
}
