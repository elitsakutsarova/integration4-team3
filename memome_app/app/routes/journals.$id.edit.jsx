import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import EditJournalPage from '../components/journals/EditJournalPage';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import { useCustomJournals } from '../context/CreateJournalContext';
import { findJournalById } from '../utils/journalBuilder';
import { paths } from '../utils/appPaths';

export function meta() {
  return [
    { title: 'MemoMe — Edit Journal' },
    { name: 'description', content: 'Edit your travel journal.' },
  ];
}

export default function JournalsEditRoute({ params }) {
  const navigate = useNavigate();
  const { createdMemos } = useCreatedMemos();
  const { customJournals } = useCustomJournals();
  const journal = findJournalById(createdMemos, params.id, customJournals);

  // Journal lives in client storage — redirect if the URL id is unknown.
  useEffect(() => {
    if (!journal) {
      navigate(paths.journals, { replace: true });
    }
  }, [journal, navigate]);

  if (!journal) {
    return (
      <div className="edit-journal-page edit-journal-page--loading">
        <p>Loading your journal…</p>
      </div>
    );
  }

  return <EditJournalPage journal={journal} />;
}
