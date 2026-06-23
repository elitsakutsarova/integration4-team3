// photon location detail — rendered inside discover desktop panel

import '../styles/modules/map.css';
import '../styles/modules/location-detail.css';
import { useLoaderData } from 'react-router';
import AuthLoading from '../components/auth/AuthLoading';
import LocationDetail from '../components/LocationDetail';
import { bootstrapAuthSession } from '../utils/authSession';
import { loadLocationPageServer } from '../utils/locationPage.server';

export function meta({ data: loaderData }) {
  const name = loaderData?.place?.name ?? 'Location';
  return [
    { title: `MemoMe — ${name}` },
    { name: 'description', content: loaderData?.place?.description ?? 'Explore this spot in Antwerp.' },
  ];
}

export async function loader(args) {
  return loadLocationPageServer(args);
}

export async function clientLoader({ serverLoader }) {
  const [data] = await Promise.all([
    serverLoader(),
    bootstrapAuthSession(),
  ]);
  return data;
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return <AuthLoading />;
}

export function shouldRevalidate({ currentParams, nextParams }) {
  return currentParams.osmType !== nextParams.osmType || currentParams.osmId !== nextParams.osmId;
}

export default function DiscoverLocationDetailRoute() {
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
