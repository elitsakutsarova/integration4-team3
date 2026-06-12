// route for the place/location detail page in the discover

import { data, useLoaderData } from 'react-router';
import PlaceDetailPage from '../components/discover/PlaceDetailPage';
import { getDiscoverPlaceById } from '../data/discoverDetails';
import { loadSpotMemos } from '../utils/loadSpotMemos';

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

  const { featuredMemos, totalMemoCount } = await loadSpotMemos({
    placeId: place.placeId,
    lat: place.ll?.[0],
    lng: place.ll?.[1],
    locationName: place.title ?? place.location,
  });

  return { place, featuredMemos, totalMemoCount };
}

clientLoader.hydrate = true;

export default function DiscoverPlaceDetail() {
  const { place, featuredMemos, totalMemoCount } = useLoaderData();
  return (
    <PlaceDetailPage
      place={place}
      featuredMemos={featuredMemos}
      totalMemoCount={totalMemoCount}
    />
  );
}
