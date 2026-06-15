import AddJournalMemosPage from '../components/journals/AddJournalMemosPage';
import CreateJournalDecorations from '../components/journals/CreateJournalDecorations';

export function meta() {
  return [
    { title: 'MemoMe — Add memories' },
    { name: 'description', content: 'Choose memos for your travel journal.' },
  ];
}

export default function JournalsCreateMemosRoute() {
  return (
    <div className="create-journal-page create-journal-page--pick-memos">
      <CreateJournalDecorations title="Add memories" />
      <AddJournalMemosPage />
    </div>
  );
}
