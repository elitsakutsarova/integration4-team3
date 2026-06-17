import { useMemo } from 'react';
import { useLoaderData } from 'react-router';
import FavouritesSpotsPage from '../components/profile/FavouritesSpotsPage';
import FavouritesLoading from '../components/profile/FavouritesLoading';
import { useDiscoverFaves } from '../context/DiscoverFavesContext';
import { useRevalidateOnCount } from '../hooks/useRevalidateOnCount';
import { getAuthSnapshot } from '../utils/authSession';
import { fetchDiscoverFaves } from '../utils/discoverFavesStore';
import { resolveDiscoverFaveItems } from '../utils/resolveDiscoverFaveItems';

export async function clientLoader() {
  const { user } = getAuthSnapshot();
  const faves = await fetchDiscoverFaves(user?.id ?? null);
  const favouritePlaces = resolveDiscoverFaveItems(faves, 'place', user?.id ?? null);
  return { favouritePlaces };
}

clientLoader.hydrate = true;

export function shouldRevalidate({ defaultShouldRevalidate }) {
  return defaultShouldRevalidate;
}

export function HydrateFallback() {
  return <FavouritesLoading />;
}

export default function ProfileFavouritesSpotsRoute() {
  const { favouritePlaces } = useLoaderData();
  const { faves, favesCount } = useDiscoverFaves();
  useRevalidateOnCount(favesCount);

  const visiblePlaces = useMemo(() => {
    const savedIds = new Set(
      faves.filter(fave => fave.type === 'place').map(fave => String(fave.id)),
    );
    return favouritePlaces.filter(entry => savedIds.has(String(entry.item.id)));
  }, [favouritePlaces, faves]);

  return <FavouritesSpotsPage favouritePlaces={visiblePlaces} />;
}
