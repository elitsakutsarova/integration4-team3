import { useOutletContext } from 'react-router';
import FavouritesMemosPage from '../components/profile/FavouritesMemosPage';

export default function ProfileFavouritesMemosRoute() {
  const { favouriteMemos, favouriteMemosPending } = useOutletContext();

  return (
    <FavouritesMemosPage
      favouriteMemos={favouriteMemos}
      favouriteMemosPending={favouriteMemosPending}
    />
  );
}
