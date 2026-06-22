import '../styles/modules/profile-collections.css';
import '../styles/modules/map.css';
import '../styles/modules/diary.css';
import { useMemo } from 'react';
import FavouritesLayout from '../components/profile/FavouritesLayout';
import CollectionPagePending from '../components/profile/CollectionPagePending';
import { useDiscoverFaves } from '../context/DiscoverFavesContext';
import { useSavedMemos } from '../context/SavedMemosContext';
import { useHydratedSavedMemos } from '../hooks/useHydratedSavedMemos';
import { loadProfileFavouritesData } from '../utils/profileFavouritesLoader';

export function meta() {
  return [
    { title: 'MemoMe — Favourites' },
    { name: 'description', content: 'Your favourite memos, spots, and events.' },
  ];
}

export function HydrateFallback() {
  return <CollectionPagePending title="Favourites" showTabs />;
}

export default function ProfileFavouritesLayoutRoute() {
  const { savedMemos } = useSavedMemos();
  const { faves } = useDiscoverFaves();
  const favouritesData = useMemo(
    () => loadProfileFavouritesData(),
    [savedMemos, faves],
  );
  const { memos: favouriteMemos, pending: favouriteMemosPending } = useHydratedSavedMemos(
    savedMemos,
    favouritesData.favouriteMemosSync,
  );

  return (
    <FavouritesLayout
      outletContext={{
        ...favouritesData,
        favouriteMemos,
        favouriteMemosPending,
      }}
    />
  );
}
