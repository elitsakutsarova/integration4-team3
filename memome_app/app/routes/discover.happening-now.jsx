// route for the events happening now/soon list page in the discover

import { useLoaderData } from 'react-router';
import DiscoverListPage from '../components/discover/DiscoverListPage';
import { HAPPENING_NOW_ALL } from '../data/discoverContent';

export function meta() {
  return [
    { title: 'MemoMe — Happening now' },
    { name: 'description', content: 'Live events happening now in Antwerp.' },
  ];
}

export async function loader() {
  return {
    title: 'Happening now',
    highlightWidth: '10.75rem',
    decoration: 'live',
    items: HAPPENING_NOW_ALL,
    itemType: 'event',
  };
}

export async function clientLoader() {
  return {
    title: 'Happening now',
    highlightWidth: '10.75rem',
    decoration: 'live',
    items: HAPPENING_NOW_ALL,
    itemType: 'event',
  };
}

clientLoader.hydrate = true;

export function shouldRevalidate() {
  return false;
}

export default function DiscoverHappeningNow() {
  const listProps = useLoaderData();
  return <DiscoverListPage {...listProps} />;
}
