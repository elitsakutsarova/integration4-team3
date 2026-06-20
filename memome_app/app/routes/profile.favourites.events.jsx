import { useOutletContext } from 'react-router';
import FavouritesEventsPage from '../components/profile/FavouritesEventsPage';

export default function ProfileFavouritesEventsRoute() {
  const { favouriteEvents } = useOutletContext();

  return <FavouritesEventsPage favouriteEvents={favouriteEvents} />;
}
