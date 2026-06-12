import DiscoverListPage from '../components/discover/DiscoverListPage';
import { UPCOMING_ALL } from '../data/discoverContent';

export function meta() {
  return [
    { title: 'MemoMe — Upcoming' },
    { name: 'description', content: 'Upcoming events in Antwerp.' },
  ];
}

export default function DiscoverUpcoming() {
  return (
    <DiscoverListPage
      title="Upcoming"
      highlightWidth="116px"
      decoration="upcoming"
      items={UPCOMING_ALL}
      itemType="event"
    />
  );
}
