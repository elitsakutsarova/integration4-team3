import '../styles/modules/journals.css';
import EditJournalPage from '../components/journals/EditJournalPage';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import { useCustomJournals } from '../context/CreateJournalContext';
import { findJournalById } from '../utils/journalBuilder';
import { requireJournalClientLoader } from '../utils/journalRouteClientLoader';

export function meta() {
  return [
    { title: 'MemoMe - Edit Journal' },
    { name: 'description', content: 'Edit your travel journal.' },
  ];
}

export async function clientLoader(args) {
  return requireJournalClientLoader(args);
}

clientLoader.hydrate = true;

export default function JournalsEditRoute({ params }) {
  const { createdMemos } = useCreatedMemos();
  const { customJournals } = useCustomJournals();
  const journal = findJournalById(createdMemos, params.id, customJournals);

  if (!journal) {
    return (
      <div className="edit-journal-page edit-journal-page--loading">
        <p>Loading your journal…</p>
      </div>
    );
  }

  return <EditJournalPage journal={journal} />;
}
