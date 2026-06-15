import { Navigate } from 'react-router';
import JournalDetailPage from '../components/journals/JournalDetailPage';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import { useCustomJournals } from '../context/CreateJournalContext';
import { findJournalById } from '../utils/journalBuilder';
import { paths } from '../utils/appPaths';

export function meta() {
  return [
    { title: 'MemoMe — Journal' },
    { name: 'description', content: 'Your travel journal memories and stickers.' },
  ];
}

export default function DiaryDetail({ params }) {
  const { createdMemos, ready } = useCreatedMemos();
  const { customJournals } = useCustomJournals();
  const journal = findJournalById(createdMemos, params.id, customJournals);

  if (!ready) {
    return (
      <div className="journal-detail-page journal-detail-page--loading">
        <p>Loading your journal…</p>
      </div>
    );
  }

  if (!journal) {
    return <Navigate to={paths.journals} replace />;
  }

  return (
    <JournalDetailPage
      journal={journal}
      memories={journal.memos}
      backTo={paths.journals}
    />
  );
}
