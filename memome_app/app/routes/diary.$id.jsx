import '../styles/modules/diary.css';
import '../styles/modules/profile-collections.css';
import '../styles/modules/journals.css';
import JournalDetailPage from '../components/journals/JournalDetailPage';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import { useCustomJournals } from '../context/CreateJournalContext';
import { findJournalById } from '../utils/journalBuilder';
import { paths } from '../utils/appPaths';
import { requireJournalClientLoader } from '../utils/journalRouteClientLoader';

export function meta() {
  return [
    { title: 'MemoMe — Journal' },
    { name: 'description', content: 'Your travel journal memories and stickers.' },
  ];
}

export async function clientLoader(args) {
  return requireJournalClientLoader(args);
}

clientLoader.hydrate = true;

export default function DiaryDetail({ params }) {
  const { createdMemos } = useCreatedMemos();
  const { customJournals } = useCustomJournals();
  const journal = findJournalById(createdMemos, params.id, customJournals);

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
