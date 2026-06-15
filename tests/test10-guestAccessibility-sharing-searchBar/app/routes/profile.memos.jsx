// route for the created memos page

import { useCreatedMemos } from '../context/CreatedMemosContext';
import CreatedMemosPage from '../components/profile/CreatedMemosPage';

export function meta() {
  return [
    { title: 'MemoMe — Created Memos' },
    { name: 'description', content: 'All memos you have published on the map.' },
  ];
}

export default function ProfileMemosRoute() {
  const { createdMemos } = useCreatedMemos();
  return <CreatedMemosPage memos={createdMemos} />;
}
