import FavouritesLayout from '../components/profile/FavouritesLayout';
import { requireAuthMiddleware } from '../middleware/clientAuth';

export const clientMiddleware = requireAuthMiddleware;

export function meta() {
  return [
    { title: 'MemoMe — Favourites' },
    { name: 'description', content: 'Your favourite memos, spots, and events.' },
  ];
}

export default function ProfileFavouritesLayoutRoute() {
  return <FavouritesLayout />;
}
