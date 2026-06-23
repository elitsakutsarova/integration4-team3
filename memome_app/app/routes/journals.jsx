import '../styles/modules/journals.css';
import { useAuth } from '../context/AuthContext';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import GuestJournalsLockedPage from '../components/journals/GuestJournalsLockedPage';
import JournalsPage from '../components/journals/JournalsPage';

export function meta() {
  return [
    { title: 'MemoMe - Journals' },
    { name: 'description', content: 'Your Antwerp travel journals and trip albums.' },
  ];
}

export default function JournalsRoute() {
  const { user } = useAuth();
  const { createdMemos, ready } = useCreatedMemos();

  if (!user) {
    return <GuestJournalsLockedPage />;
  }

  return <JournalsPage memos={createdMemos} ready={ready} />;
}
