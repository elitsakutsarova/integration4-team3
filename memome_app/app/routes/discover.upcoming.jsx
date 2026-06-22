// route for the incoming events list page in the discover

import { useLoaderData } from 'react-router';
import DiscoverListPage from '../components/discover/DiscoverListPage';
import { UPCOMING_ALL } from '../data/discoverContent';

export function meta() {
  return [
    { title: 'MemoMe — Upcoming' },
    { name: 'description', content: 'Upcoming events in Antwerp.' },
  ];
}

export async function loader() {
  return {
    title: 'Upcoming',
    highlightWidth: '7.25rem',
    decoration: 'upcoming',
    items: UPCOMING_ALL,
    itemType: 'event',
  };
}

export async function clientLoader() {
  return {
    title: 'Upcoming',
    highlightWidth: '7.25rem',
    decoration: 'upcoming',
    items: UPCOMING_ALL,
    itemType: 'event',
  };
}

clientLoader.hydrate = true;

export function shouldRevalidate() {
  return false;
}

export default function DiscoverUpcoming() {
  const listProps = useLoaderData();
  return <DiscoverListPage {...listProps} />;
}
