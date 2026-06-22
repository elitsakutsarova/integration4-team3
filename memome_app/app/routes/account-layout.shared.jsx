import '../styles/modules/bottom-nav.css';
import '../styles/modules/profile-collections.css';
import { Outlet, useLocation, useNavigation } from 'react-router';
import BottomNav from '../components/BottomNav';
import CollectionPagePending from '../components/profile/CollectionPagePending';

function isPendingFavouritesNavigation(navigation, currentPathname) {
  if (navigation.state !== 'loading') return false;

  const nextPathname = navigation.location?.pathname ?? '';
  if (!nextPathname.startsWith('/profile/favourites')) return false;

  return !currentPathname.startsWith('/profile/favourites');
}

export default function AccountLayout() {
  const navigation = useNavigation();
  const { pathname } = useLocation();
  const pendingFavourites = isPendingFavouritesNavigation(navigation, pathname);

  return (
    <>
      {pendingFavourites ? (
        <CollectionPagePending title="Favourites" showTabs />
      ) : (
        <Outlet />
      )}
      <div className="bottom-nav-container">
        <BottomNav />
      </div>
    </>
  );
}
