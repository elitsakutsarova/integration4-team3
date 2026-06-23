import '../styles/modules/map.css';
import '../styles/modules/profile-collections.css';
import '../styles/modules/journals.css';
import AddJournalMemosPage from '../components/journals/AddJournalMemosPage';

export function meta() {
  return [
    { title: 'MemoMe - Add memories' },
    { name: 'description', content: 'Choose memos for your travel journal.' },
  ];
}

export default function JournalsCreateMemosRoute() {
  return (
    <div className="create-journal-page create-journal-page--pick-memos">
      <AddJournalMemosPage />
    </div>
  );
}
