import { data, useLoaderData } from 'react-router';
import EventDetailPage from '../components/discover/EventDetailPage';
import { getDiscoverEventById } from '../data/discoverDetails';

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
  return { event };
}

clientLoader.hydrate = true;

export default function DiscoverEventDetail() {
  const { event } = useLoaderData();
  return <EventDetailPage event={event} />;
}
