import { redirect } from 'react-router';
import TravelDiaryViewer from '../components/TravelDiaryViewer';
import { TRAVEL_DIARY } from '../data/mockUser';
import { diaryPath } from '../utils/appPaths';
import { requireAuthMiddleware } from '../middleware/clientAuth';

export const clientMiddleware = requireAuthMiddleware;

export function meta() {
  return [
    { title: `MemoMe — ${TRAVEL_DIARY.title}` },
    { name: 'description', content: 'Flip through your Antwerp travel diary.' },
  ];
}

export function loader({ params }) {
  if (params.id !== TRAVEL_DIARY.id) {
    throw redirect(diaryPath(TRAVEL_DIARY.id));
  }
  return null;
}

export default function DiaryDetail() {
  return <TravelDiaryViewer />;
}
