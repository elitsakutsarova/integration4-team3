// route for the event detail page in the discover

import { redirect, useLoaderData } from 'react-router';
import AuthLoading from '../components/auth/AuthLoading';
import EventDetailPage from '../components/discover/EventDetailPage';
import { getDiscoverEventById } from '../data/discoverDetails';
import { paths } from '../utils/appPaths';
import { loadSpotMemos } from '../utils/loadSpotMemos';
import { buildMemoArchiveHref } from '../utils/locationHref';
import { resolveNavigableLocationHref } from '../utils/navigableLocation';
import { resolveDiscoverPlaceSpot } from '../utils/resolveDiscoverPlaceSpot';

export function meta({ data: loaderData }) {
  const title = loaderData?.event?.title ?? 'Event';
  return [
    { title: `MemoMe — ${title}` },
    { name: 'description', content: `Discover ${title} in Antwerp.` },
  ];
}

export async function loader({ params }) {
  const event = getDiscoverEventById(params.id);
  if (!event) {
    throw redirect(paths.discover);
  }
  return { event };
}

export async function clientLoader({ serverLoader }) {
  const { event } = await serverLoader();

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

  const venueHref = await resolveNavigableLocationHref({
    placeId: resolvedEvent.placeId ?? event.placeId,
    lat: resolvedEvent.ll?.[0] ?? event.ll?.[0],
    lng: resolvedEvent.ll?.[1] ?? event.ll?.[1],
    name: event.venueName ?? event.location,
  });

  const archiveHref = venueHref
    ? buildMemoArchiveHref({
      placeId: resolvedEvent.placeId ?? event.placeId,
      lat: resolvedEvent.ll?.[0] ?? event.ll?.[0],
      lng: resolvedEvent.ll?.[1] ?? event.ll?.[1],
      name: event.venueName ?? event.location,
      title: event.title,
    })
    : null;

  return {
    event: {
      ...event,
      placeId: resolvedEvent.placeId ?? event.placeId,
      ll: resolvedEvent.ll ?? event.ll,
    },
    featuredMemos,
    totalMemoCount,
    venueHref,
    archiveHref,
  };
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return <AuthLoading />;
}

export function shouldRevalidate({ currentParams, nextParams }) {
  return currentParams.id !== nextParams.id;
}

export default function DiscoverEventDetail() {
  const { event, featuredMemos, totalMemoCount, venueHref, archiveHref } = useLoaderData();
  return (
    <EventDetailPage
      event={event}
      featuredMemos={featuredMemos}
      totalMemoCount={totalMemoCount}
      venueHref={venueHref}
      archiveHref={archiveHref}
    />
  );
}
