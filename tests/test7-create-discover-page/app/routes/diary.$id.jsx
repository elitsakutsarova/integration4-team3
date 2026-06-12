import { redirect } from 'react-router';
import TravelDiaryViewer from '../components/TravelDiaryViewer';
import { TRAVEL_DIARY } from '../data/mockUser';
import { FALLBACK_DIARY } from '../utils/safeRouteFallbacks';

export function meta() {
  return [
    { title: `MemoMe — ${TRAVEL_DIARY.title}` },
    { name: 'description', content: 'Flip through your Antwerp travel diary.' },
  ];
}

export function clientLoader({ params }) {
  if (params.id !== TRAVEL_DIARY.id) {
    throw redirect(FALLBACK_DIARY);
  }
  return null;
}

clientLoader.hydrate = true;

export default function DiaryDetail() {
  return <TravelDiaryViewer />;
}
