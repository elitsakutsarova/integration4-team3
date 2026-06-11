import MapView from '../components/MapView';
import { requireAuthInLoader } from '../utils/requireAuthLoader';

export function meta() {
  return [
    { title: 'MemoMe — Map' },
    { name: 'description', content: 'Pin your memories on the map.' },
  ];
}

export async function clientLoader() {
  await requireAuthInLoader();
  return null;
}

clientLoader.hydrate = true;

export default function Home() {
  return <MapView />;
}
