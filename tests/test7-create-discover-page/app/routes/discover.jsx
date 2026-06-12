import DiscoverPage from '../components/DiscoverPage';

export function meta() {
  return [
    { title: 'MemoMe — Discover' },
    { name: 'description', content: 'Discover events and places in Antwerp.' },
  ];
}

export default function Discover() {
  return <DiscoverPage />;
}
