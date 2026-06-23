// discover home — static lists from server loader

import { useLoaderData } from 'react-router';
import DiscoverPage from '../components/DiscoverPage';
import {
  HAPPENING_NOW,
  PLACES_WORTH_MEMO,
  UPCOMING,
} from '../data/discoverContent';

export function meta() {
  return [
    { title: 'MemoMe - Discover' },
    { name: 'description', content: 'Discover events and places in Antwerp.' },
  ];
}

export async function loader() {
  return {
    happeningNow: HAPPENING_NOW,
    upcoming: UPCOMING,
    places: PLACES_WORTH_MEMO,
  };
}

export async function clientLoader() {
  return {
    happeningNow: HAPPENING_NOW,
    upcoming: UPCOMING,
    places: PLACES_WORTH_MEMO,
  };
}

clientLoader.hydrate = true;

export function shouldRevalidate() {
  return false;
}

export default function DiscoverIndex() {
  const { happeningNow, upcoming, places } = useLoaderData();
  return (
    <DiscoverPage
      happeningNow={happeningNow}
      upcoming={upcoming}
      places={places}
    />
  );
}
