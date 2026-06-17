import { useEffect } from 'react';
import { useNavigate } from 'react-router';
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
  const navigate = useNavigate();
  const { createdMemos } = useCreatedMemos();
  const { customJournals } = useCustomJournals();
  const journal = findJournalById(createdMemos, params.id, customJournals);

  useEffect(() => {
    if (!journal) {
      navigate(paths.journals, { replace: true });
    }
  }, [journal, navigate]);

  if (!journal) {
    return (
      <div className="journal-detail-page journal-detail-page--loading">
        <p>Loading your journal…</p>
      </div>
    );
  }

  return (
    <JournalDetailPage
      journal={journal}
      memories={journal.memos}
      backTo={paths.journals}
    />
  );
}
