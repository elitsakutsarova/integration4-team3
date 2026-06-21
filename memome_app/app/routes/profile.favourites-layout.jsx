import '../styles/modules/profile-collections.css';
import '../styles/modules/map.css';
import { useLoaderData } from 'react-router';
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

export default function ProfileFavouritesLayoutRoute() {
  const loaderData = useLoaderData();
  const { savedMemos } = useSavedMemos();
  const { faves } = useDiscoverFaves();

  useRevalidateOnCount(savedMemos.length + faves.length);

  return <FavouritesLayout outletContext={loaderData} />;
}
