// route for the place/location detail page in the discover

import { redirect, useLoaderData } from 'react-router';
import PlaceDetailPage from '../components/discover/PlaceDetailPage';
import { getDiscoverPlaceById } from '../data/discoverDetails';
import { paths } from '../utils/appPaths';
import { loadSpotMemos } from '../utils/loadSpotMemos';
import { resolveDiscoverPlaceSpot } from '../utils/resolveDiscoverPlaceSpot';

export function meta({ data: loaderData }) {
  const title = loaderData?.place?.title ?? 'Place';
  return [
    { title: `MemoMe — ${title}` },
    { name: 'description', content: `Discover ${title} in Antwerp.` },
  ];
}

export async function loader({ params }) {
  const place = getDiscoverPlaceById(params.id);
  if (!place) {
    throw redirect(paths.discover);
  }
  return { place };
}

export async function clientLoader({ serverLoader }) {
  const { place } = await serverLoader();
  const resolvedPlace = await resolveDiscoverPlaceSpot(place);

  const { featuredMemos, totalMemoCount } = await loadSpotMemos({
    placeId: resolvedPlace.placeId,
    lat: resolvedPlace.ll?.[0],
    lng: resolvedPlace.ll?.[1],
    locationName: resolvedPlace.title ?? resolvedPlace.location,
  });

  return { place: resolvedPlace, featuredMemos, totalMemoCount };
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
