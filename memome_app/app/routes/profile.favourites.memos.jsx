import { useMemo } from 'react';
import { useLoaderData } from 'react-router';
import FavouritesMemosPage from '../components/profile/FavouritesMemosPage';
import FavouritesLoading from '../components/profile/FavouritesLoading';
import { useSavedMemos } from '../context/SavedMemosContext';
import { useRevalidateOnCount } from '../hooks/useRevalidateOnCount';
import { getAuthSnapshot } from '../utils/authSession';
import { hydrateSavedMemos } from '../utils/hydrateSavedMemos';
import { fetchSavedMemos } from '../utils/savedMemosStore';
import { resolveNavigableLocationHref } from '../utils/navigableLocation';

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
  const savedMemos = await fetchSavedMemos(user?.id ?? null);
  const hydrated = await hydrateSavedMemos(savedMemos);
  const favouriteMemos = await Promise.all(hydrated.map(enrichWithLocationHref));
  return { favouriteMemos };
}

clientLoader.hydrate = true;

export function shouldRevalidate({ defaultShouldRevalidate }) {
  return defaultShouldRevalidate;
}

export function HydrateFallback() {
  return <FavouritesLoading />;
}

export default function ProfileFavouritesMemosRoute() {
  const { favouriteMemos } = useLoaderData();
  const { savedMemos, memosCount } = useSavedMemos();
  useRevalidateOnCount(memosCount);

  const visibleMemos = useMemo(() => {
    const savedIds = new Set(savedMemos.map(entry => String(entry.id)));
    return favouriteMemos.filter(memo => savedIds.has(String(memo.id)));
  }, [favouriteMemos, savedMemos]);

  return <FavouritesMemosPage favouriteMemos={visibleMemos} />;
}
