import { redirect } from 'react-router';
import TravelDiaryViewer from '../components/TravelDiaryViewer';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import { useCustomJournals } from '../context/CreateJournalContext';
import { findJournalById } from '../utils/journalBuilder';
import { paths } from '../utils/appPaths';

export function meta() {
  return [
    { title: 'MemoMe — Travel Diary' },
    { name: 'description', content: 'Flip through your Antwerp travel diary.' },
  ];
}

export default function DiaryDetail({ params }) {
  const { createdMemos, ready } = useCreatedMemos();
  const { customJournals } = useCustomJournals();
  const journal = findJournalById(createdMemos, params.id, customJournals);

  if (!ready) {
    return (
      <div className="diary-viewer diary-viewer--loading">
        <p>Loading your diary…</p>
      </div>
    );
  }

  if (!journal) {
    throw redirect(paths.journals);
  }

  return (
    <TravelDiaryViewer
      diary={journal}
      memories={journal.memos}
      backTo={paths.journals}
    />
  );
}
