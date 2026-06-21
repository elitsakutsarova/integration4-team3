import '../styles/modules/profile-collections.css';
import '../styles/modules/map.css';
import '../styles/modules/diary.css';
import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import FavouritesLayout from '../components/profile/FavouritesLayout';
import { useDiscoverFaves } from '../context/DiscoverFavesContext';
import { useSavedMemos } from '../context/SavedMemosContext';
import { useRevalidateOnCount } from '../hooks/useRevalidateOnCount';
import { loadProfileFavouritesData } from '../utils/profileFavouritesLoader';

export function meta() {
  return [
    { title: 'MemoMe — Favourites' },
    { name: 'description', content: 'Your favourite memos, spots, and events.' },
  ];
}

export function clientLoader() {
  return loadProfileFavouritesData();
}

export function shouldRevalidate({ defaultShouldRevalidate }) {
  return defaultShouldRevalidate;
}

function buildOutletContext(loaderData, favouriteMemos, favouriteMemosPending) {
  return {
    ...loaderData,
    favouriteMemos,
    favouriteMemosPending,
  };
}

function FavouritesLayoutWithSyncData({ loaderData }) {
  return (
    <FavouritesLayout
      outletContext={buildOutletContext(
        loaderData,
        loaderData.favouriteMemosSync,
        true,
      )}
    />
  );
}

export default function ProfileFavouritesLayoutRoute() {
  const loaderData = useLoaderData();
  const { savedMemos } = useSavedMemos();
  const { faves } = useDiscoverFaves();

  useRevalidateOnCount(savedMemos.length + faves.length);

  return (
    <Suspense fallback={<FavouritesLayoutWithSyncData loaderData={loaderData} />}>
      <Await
        resolve={loaderData.favouriteMemos}
        errorElement={<FavouritesLayoutWithSyncData loaderData={loaderData} />}
      >
        {(resolvedMemos) => (
          <FavouritesLayout
            outletContext={buildOutletContext(loaderData, resolvedMemos, false)}
          />
        )}
      </Await>
    </Suspense>
  );
}
