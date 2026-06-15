import { Navigate } from 'react-router';
import AddJournalMemosPage from '../components/journals/AddJournalMemosPage';
import CreateJournalDecorations from '../components/journals/CreateJournalDecorations';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import { useCustomJournals } from '../context/CreateJournalContext';
import { findJournalById } from '../utils/journalBuilder';
import { paths } from '../utils/appPaths';

export function meta() {
  return [
    { title: 'MemoMe — Add memories' },
    { name: 'description', content: 'Choose memos for your travel journal.' },
  ];
}

export default function JournalsEditMemosRoute({ params }) {
  const { createdMemos, ready } = useCreatedMemos();
  const { customJournals } = useCustomJournals();
  const journal = findJournalById(createdMemos, params.id, customJournals);

  if (!ready) {
    return (
      <div className="create-journal-page create-journal-page--loading">
        <p>Loading your memos…</p>
      </div>
    );
  }

  if (!journal) {
    return <Navigate to={paths.journals} replace />;
  }

  return (
    <div className="create-journal-page create-journal-page--pick-memos">
      <CreateJournalDecorations title="Add memories" />
      <AddJournalMemosPage flow="edit" journalId={params.id} />
    </div>
  );
}
