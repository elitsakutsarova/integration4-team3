// route for the event detail page in the discover

import { redirect, useLoaderData } from 'react-router';
import EventDetailPage from '../components/discover/EventDetailPage';
import { getDiscoverEventById } from '../data/discoverDetails';
import { loadSpotMemos } from '../utils/loadSpotMemos';
import { resolveDiscoverPlaceSpot } from '../utils/resolveDiscoverPlaceSpot';
import { FALLBACK_DISCOVER } from '../utils/safeRouteFallbacks';

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
    throw redirect(FALLBACK_DISCOVER);
  }

  const resolvedEvent = await resolveDiscoverPlaceSpot({
    ...event,
    title: event.venueName ?? event.location,
    location: event.venueAddress ?? event.location,
    mapsQuery: event.mapsQuery,
    placeId: event.placeId,
    ll: event.ll,
  });

  const { featuredMemos, totalMemoCount } = await loadSpotMemos({
    placeId: resolvedEvent.placeId,
    lat: resolvedEvent.ll?.[0],
    lng: resolvedEvent.ll?.[1],
    locationName: event.venueName ?? event.location,
  });

  return {
    event: {
      ...event,
      placeId: resolvedEvent.placeId ?? event.placeId,
      ll: resolvedEvent.ll ?? event.ll,
    },
    featuredMemos,
    totalMemoCount,
  };
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
