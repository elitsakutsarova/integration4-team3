import { useOutletContext } from 'react-router';
import FavouritesSpotsPage from '../components/profile/FavouritesSpotsPage';

export default function ProfileFavouritesSpotsRoute() {
  const { favouritePlaces } = useOutletContext();

  return <FavouritesSpotsPage favouritePlaces={favouritePlaces} />;
}
