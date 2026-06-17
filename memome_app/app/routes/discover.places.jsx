// route for the places list page in the discover

import { useLoaderData } from 'react-router';
import DiscoverListPage from '../components/discover/DiscoverListPage';
import { PLACES_WORTH_MEMO_ALL } from '../data/discoverContent';

export function meta() {
  return [
    { title: 'MemoMe — Places worth a memo' },
    { name: 'description', content: 'Places worth a memo in Antwerp.' },
  ];
}

export async function loader() {
  return {
    title: 'Places worth a memo',
    highlightWidth: '229px',
    underlined: true,
    decoration: 'places',
    items: PLACES_WORTH_MEMO_ALL,
    itemType: 'place',
  };
}

export async function clientLoader() {
  return {
    title: 'Places worth a memo',
    highlightWidth: '229px',
    underlined: true,
    decoration: 'places',
    items: PLACES_WORTH_MEMO_ALL,
    itemType: 'place',
  };
}

clientLoader.hydrate = true;

export function shouldRevalidate() {
  return false;
}

export default function DiscoverPlaces() {
  const listProps = useLoaderData();
  return <DiscoverListPage {...listProps} />;
}
