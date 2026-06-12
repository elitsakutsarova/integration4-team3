// route for the event detail page in the discover

import { data, useLoaderData } from 'react-router';
import EventDetailPage from '../components/discover/EventDetailPage';
import { getDiscoverEventById } from '../data/discoverDetails';
import { loadSpotMemos } from '../utils/loadSpotMemos';

export function meta({ data: loaderData }) {
  const title = loaderData?.event?.title ?? 'Event';
  return [
    { title: `MemoMe — ${title}` },
    { name: 'description', content: `Discover ${title} in Antwerp.` },
  ];
}

export async function clientLoader({ params }) {
  const event = getDiscoverEventById(params.id);
  if (!event) {
    throw data('Event not found', { status: 404 });
  }

  const { featuredMemos, totalMemoCount } = await loadSpotMemos({
    placeId: event.placeId,
    lat: event.ll?.[0],
    lng: event.ll?.[1],
    locationName: event.venueName ?? event.location,
  });

  return { event, featuredMemos, totalMemoCount };
}

clientLoader.hydrate = true;

export default function DiscoverEventDetail() {
  const { event, featuredMemos, totalMemoCount } = useLoaderData();
  return (
    <EventDetailPage
      event={event}
      featuredMemos={featuredMemos}
      totalMemoCount={totalMemoCount}
    />
  );
}
