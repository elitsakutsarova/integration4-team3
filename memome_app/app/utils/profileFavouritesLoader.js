import { getAuthSnapshot } from './authSession';
import { hydrateSavedMemos, hydrateSavedMemosSync } from './hydrateSavedMemos';
import { enrichMemosWithLocationHrefsSync } from './memoLocationHrefs';
import { resolveDiscoverFaveItems } from './resolveDiscoverFaveItems';
import {
  getDiscoverFavesSnapshot,
  getSavedMemosSnapshot,
} from './sessionCollectionsSnapshot';

export function loadProfileFavouritesData() {
  const userId = getAuthSnapshot().user?.id ?? null;
  const savedEntries = getSavedMemosSnapshot();
  const faves = getDiscoverFavesSnapshot();
  const favouriteMemosSync = enrichMemosWithLocationHrefsSync(
    hydrateSavedMemosSync(savedEntries),
  );

  return {
    userId,
    savedMemoCount: savedEntries.length,
    favouritePlaces: resolveDiscoverFaveItems(faves, 'place', userId),
    favouriteEvents: resolveDiscoverFaveItems(faves, 'event'),
    favouriteMemosSync,
  };
}
