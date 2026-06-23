// route for the created memos page

import '../styles/modules/profile-collections.css';
import '../styles/modules/map.css';
import '../styles/modules/diary.css';
import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import CreatedMemosPage from '../components/profile/CreatedMemosPage';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import { useRevalidateOnCount } from '../hooks/useRevalidateOnCount';
import { getAuthSnapshot, bootstrapAuthSession } from '../utils/authSession';
import { enrichMemosWithLocationHrefs, enrichMemosWithLocationHrefsSync } from '../utils/memoLocationHrefs';
import { fetchCreatedMemosByUser } from '../utils/memoStore';
import { getCreatedMemosSnapshot, setCreatedMemosSnapshot } from '../utils/sessionCollectionsSnapshot';

export function meta() {
  return [
    { title: 'MemoMe - Created Memos' },
    { name: 'description', content: 'All memos you have published on the map.' },
  ];
}

export async function clientLoader() {
  await bootstrapAuthSession();
  const { user } = getAuthSnapshot();
  const userId = user?.id ?? null;

  let createdMemos = getCreatedMemosSnapshot();
  if (!createdMemos.length && userId) {
    createdMemos = await fetchCreatedMemosByUser(userId);
    setCreatedMemosSnapshot(createdMemos);
  }

  return {
    memosSync: enrichMemosWithLocationHrefsSync(createdMemos),
    memos: enrichMemosWithLocationHrefs(createdMemos),
  };
}

clientLoader.hydrate = true;

export function shouldRevalidate({ defaultShouldRevalidate }) {
  return defaultShouldRevalidate;
}

export default function ProfileMemosRoute() {
  const { memosSync, memos } = useLoaderData();
  const { createdCount } = useCreatedMemos();

  useRevalidateOnCount(createdCount);

  return (
    <Suspense fallback={<CreatedMemosPage memos={memosSync} />}>
      <Await
        resolve={memos}
        errorElement={<CreatedMemosPage memos={memosSync} />}
      >
        {(resolved) => <CreatedMemosPage memos={resolved} />}
      </Await>
    </Suspense>
  );
}
