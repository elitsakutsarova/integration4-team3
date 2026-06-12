// route for the user favourites page

import { useEffect, useMemo, useState } from 'react';
import FavouritesPage from '../components/profile/FavouritesPage';
import { useDiscoverFaves } from '../context/DiscoverFavesContext';
import { useSavedMemos } from '../context/SavedMemosContext';
import { hydrateSavedMemos } from '../utils/hydrateSavedMemos';
import { resolveDiscoverFaveItems } from '../utils/resolveDiscoverFaveItems';

export function meta() {
  return [
    { title: 'MemoMe — Favourites' },
    { name: 'description', content: 'Your favourite memos, spots, and events.' },
  ];
}

export default function ProfileFavouritesRoute() {
  const { savedMemos, ready: savedReady } = useSavedMemos();
  const { faves, ready: favesReady } = useDiscoverFaves();
  const [favouriteMemos, setFavouriteMemos] = useState([]);
  const [memosReady, setMemosReady] = useState(false);

  const resolvedFaves = useMemo(() => resolveDiscoverFaveItems(faves), [faves]);
  const favouriteEvents = useMemo(
    () => resolvedFaves.filter(entry => entry.type === 'event'),
    [resolvedFaves],
  );
  const favouritePlaces = useMemo(
    () => resolvedFaves.filter(entry => entry.type === 'place'),
    [resolvedFaves],
  );

  useEffect(() => {
    if (!savedReady) return;

    let cancelled = false;

    void hydrateSavedMemos(savedMemos).then(memos => {
      if (!cancelled) {
        setFavouriteMemos(memos);
        setMemosReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [savedMemos, savedReady]);

  if (!savedReady || !favesReady || !memosReady) {
    return (
      <div className="collection-page collection-page--loading">
        <div className="auth-loading">
          <div className="auth-loading-dot" />
        </div>
      </div>
    );
  }

  return (
    <FavouritesPage
      favouriteMemos={favouriteMemos}
      favouriteEvents={favouriteEvents}
      favouritePlaces={favouritePlaces}
    />
  );
}
