import CreateJournalPage from '../components/journals/CreateJournalPage';
import CreateJournalDecorations from '../components/journals/CreateJournalDecorations';

export function meta() {
  return [
    { title: 'MemoMe — Create Journal' },
    { name: 'description', content: 'Create a new Antwerp travel journal.' },
  ];
}

export default function JournalsCreateRoute() {
  return (
    <div className="create-journal-page">
      <CreateJournalDecorations title="Create Journal" />
      <CreateJournalPage />
    </div>
  );
}
