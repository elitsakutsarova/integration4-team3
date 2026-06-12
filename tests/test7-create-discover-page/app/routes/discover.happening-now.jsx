// route for the events happening now/soon list page in the discover

import DiscoverListPage from '../components/discover/DiscoverListPage';
import { HAPPENING_NOW_ALL } from '../data/discoverContent';

export function meta() {
  return [
    { title: 'MemoMe — Happening now' },
    { name: 'description', content: 'Live events happening now in Antwerp.' },
  ];
}

export default function DiscoverHappeningNow() {
  return (
    <DiscoverListPage
      title="Happening now"
      highlightWidth="172px"
      decoration="live"
      items={HAPPENING_NOW_ALL}
      itemType="event"
    />
  );
}
