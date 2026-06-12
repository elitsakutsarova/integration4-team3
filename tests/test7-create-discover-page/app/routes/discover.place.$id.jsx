import { data, useLoaderData } from 'react-router';
import PlaceDetailPage from '../components/discover/PlaceDetailPage';
import { getDiscoverPlaceById } from '../data/discoverDetails';

export function meta({ data: loaderData }) {
  const title = loaderData?.place?.title ?? 'Place';
  return [
    { title: `MemoMe — ${title}` },
    { name: 'description', content: `Discover ${title} in Antwerp.` },
  ];
}

export async function clientLoader({ params }) {
  const place = getDiscoverPlaceById(params.id);
  if (!place) {
    throw data('Place not found', { status: 404 });
  }
  return { place };
}

clientLoader.hydrate = true;

export default function DiscoverPlaceDetail() {
  const { place } = useLoaderData();
  return <PlaceDetailPage place={place} />;
}
