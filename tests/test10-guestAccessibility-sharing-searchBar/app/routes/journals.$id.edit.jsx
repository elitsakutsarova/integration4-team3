import { Navigate } from 'react-router';
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
  const { createdMemos, ready } = useCreatedMemos();
  const { customJournals } = useCustomJournals();
  const journal = findJournalById(createdMemos, params.id, customJournals);

  if (!ready) {
    return (
      <div className="edit-journal-page edit-journal-page--loading">
        <p>Loading your journal…</p>
      </div>
    );
  }

  if (!journal) {
    return <Navigate to={paths.journals} replace />;
  }

  return <EditJournalPage journal={journal} />;
}
