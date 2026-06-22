import '../styles/modules/journals.css';
import CreateJournalPage from '../components/journals/CreateJournalPage';

export function meta() {
  return [
    { title: 'MemoMe — Create Journal' },
    { name: 'description', content: 'Create a new Antwerp travel journal.' },
  ];
}

export default function JournalsCreateRoute() {
  return (
    <div className="create-journal-page">
      <CreateJournalPage />
    </div>
  );
}
