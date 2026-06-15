import { useCreatedMemos } from '../context/CreatedMemosContext';
import JournalsPage from '../components/journals/JournalsPage';

export function meta() {
  return [
    { title: 'MemoMe — Journals' },
    { name: 'description', content: 'Your Antwerp travel journals and trip albums.' },
  ];
}

export default function JournalsRoute() {
  const { createdMemos, ready } = useCreatedMemos();
  return <JournalsPage memos={createdMemos} ready={ready} />;
}
