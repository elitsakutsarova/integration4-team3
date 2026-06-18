// route for the created memos page

import '../styles/modules/profile-collections.css';
import '../styles/modules/diary.css';
import { useLoaderData } from 'react-router';
import CreatedMemosPage from '../components/profile/CreatedMemosPage';
import FavouritesLoading from '../components/profile/FavouritesLoading';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import { getAuthSnapshot } from '../utils/authSession';
import { fetchCreatedMemosByUser } from '../utils/memoStore';
import { resolveNavigableLocationHref } from '../utils/navigableLocation';

export function meta() {
  return [
    { title: 'MemoMe — Created Memos' },
    { name: 'description', content: 'All memos you have published on the map.' },
  ];
}

async function enrichWithLocationHref(memo) {
  const locationHref = await resolveNavigableLocationHref({
    placeId: memo.placeId,
    lat: memo.ll?.[0],
    lng: memo.ll?.[1],
    name: memo.location,
  });
  return { ...memo, locationHref };
}

export async function clientLoader() {
  const { user } = getAuthSnapshot();
  const raw = await fetchCreatedMemosByUser(user?.id ?? null);
  const memos = await Promise.all(raw.map(enrichWithLocationHref));
  return { memos };
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return <FavouritesLoading />;
}

export function shouldRevalidate() {
  return false;
}

export default function ProfileMemosRoute() {
  const { memos: loaderMemos } = useLoaderData();
  const { createdMemos } = useCreatedMemos();

  const mergedMemos = (() => {
    const byId = new Map(loaderMemos.map((memo) => [memo.id, memo]));
    for (const memo of createdMemos) {
      const existing = byId.get(memo.id);
      byId.set(memo.id, {
        ...existing,
        ...memo,
        locationHref: memo.locationHref ?? existing?.locationHref,
      });
    }
    return [...byId.values()].sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
    );
  })();

  return <CreatedMemosPage memos={mergedMemos} />;
}
