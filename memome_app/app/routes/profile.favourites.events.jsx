import { useMemo } from 'react';
import { useLoaderData } from 'react-router';
import FavouritesEventsPage from '../components/profile/FavouritesEventsPage';
import FavouritesLoading from '../components/profile/FavouritesLoading';
import { useDiscoverFaves } from '../context/DiscoverFavesContext';
import { useRevalidateOnCount } from '../hooks/useRevalidateOnCount';
import { getAuthSnapshot } from '../utils/authSession';
import { fetchDiscoverFaves } from '../utils/discoverFavesStore';
import { resolveDiscoverFaveItems } from '../utils/resolveDiscoverFaveItems';

export async function clientLoader() {
  const { user } = getAuthSnapshot();
  const faves = await fetchDiscoverFaves(user?.id ?? null);
  const favouriteEvents = resolveDiscoverFaveItems(faves, 'event');
  return { favouriteEvents };
}

clientLoader.hydrate = true;

export function shouldRevalidate({ defaultShouldRevalidate }) {
  return defaultShouldRevalidate;
}

export function HydrateFallback() {
  return <FavouritesLoading />;
}

export default function ProfileFavouritesEventsRoute() {
  const { favouriteEvents } = useLoaderData();
  const { faves, favesCount } = useDiscoverFaves();
  useRevalidateOnCount(favesCount);

  const visibleEvents = useMemo(() => {
    const savedIds = new Set(
      faves.filter(fave => fave.type === 'event').map(fave => String(fave.id)),
    );
    return favouriteEvents.filter(entry => savedIds.has(String(entry.item.id)));
  }, [favouriteEvents, faves]);

  return <FavouritesEventsPage favouriteEvents={visibleEvents} />;
}
