import '../styles/modules/map.css';
import '../styles/modules/profile-collections.css';
import '../styles/modules/journals.css';
import AddJournalMemosPage from '../components/journals/AddJournalMemosPage';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import { useCustomJournals } from '../context/CreateJournalContext';
import { findJournalById } from '../utils/journalBuilder';
import { requireJournalClientLoader } from '../utils/journalRouteClientLoader';

export function meta() {
  return [
    { title: 'MemoMe - Add memories' },
    { name: 'description', content: 'Choose memos for your travel journal.' },
  ];
}

export async function clientLoader(args) {
  return requireJournalClientLoader(args);
}

clientLoader.hydrate = true;

export default function JournalsEditMemosRoute({ params }) {
  const { createdMemos } = useCreatedMemos();
  const { customJournals } = useCustomJournals();
  const journal = findJournalById(createdMemos, params.id, customJournals);

  if (!journal) {
    return (
      <div className="create-journal-page create-journal-page--loading">
        <p>Loading your memos…</p>
      </div>
    );
  }

  return (
    <div className="create-journal-page create-journal-page--pick-memos">
      <AddJournalMemosPage flow="edit" journalId={params.id} />
    </div>
  );
}
