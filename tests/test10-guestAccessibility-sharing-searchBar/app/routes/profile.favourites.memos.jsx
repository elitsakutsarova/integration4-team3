import { useLoaderData } from 'react-router';
import FavouritesMemosPage from '../components/profile/FavouritesMemosPage';
import FavouritesLoading from '../components/profile/FavouritesLoading';
import { useSavedMemos } from '../context/SavedMemosContext';
import { useRevalidateOnCount } from '../hooks/useRevalidateOnCount';
import { getAuthSnapshot } from '../utils/authSession';
import { hydrateSavedMemos } from '../utils/hydrateSavedMemos';
import { fetchSavedMemos } from '../utils/savedMemosStore';

export async function clientLoader() {
  const { user } = getAuthSnapshot();
  const savedMemos = await fetchSavedMemos(user?.id ?? null);
  const favouriteMemos = await hydrateSavedMemos(savedMemos);
  return { favouriteMemos };
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return <FavouritesLoading />;
}

export default function ProfileFavouritesMemosRoute() {
  const { favouriteMemos } = useLoaderData();
  const { memosCount } = useSavedMemos();
  useRevalidateOnCount(memosCount);

  return <FavouritesMemosPage favouriteMemos={favouriteMemos} />;
}
