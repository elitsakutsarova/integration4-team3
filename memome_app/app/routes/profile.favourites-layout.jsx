import '../styles/modules/profile-collections.css';
import FavouritesLayout from '../components/profile/FavouritesLayout';

export function meta() {
  return [
    { title: 'MemoMe — Favourites' },
    { name: 'description', content: 'Your favourite memos, spots, and events.' },
  ];
}

export default function ProfileFavouritesLayoutRoute() {
  return <FavouritesLayout />;
}
