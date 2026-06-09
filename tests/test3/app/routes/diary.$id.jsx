import TravelDiaryViewer from '../components/TravelDiaryViewer';
import { TRAVEL_DIARY } from '../data/mockUser';

export function meta() {
  return [
    { title: `MemoMe — ${TRAVEL_DIARY.title}` },
    { name: 'description', content: 'Flip through your Antwerp travel diary.' },
  ];
}

export default function DiaryDetail() {
  return <TravelDiaryViewer />;
}
