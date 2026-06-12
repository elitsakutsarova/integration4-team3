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
  const favouritePlaces = resolveDiscoverFaveItems(faves, 'place');
  return { favouritePlaces };
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return <FavouritesLoading />;
}

export default function ProfileFavouritesSpotsRoute() {
  const { favouritePlaces } = useLoaderData();
  const { favesCount } = useDiscoverFaves();
  useRevalidateOnCount(favesCount);

  return <FavouritesSpotsPage favouritePlaces={favouritePlaces} />;
}
