// this component displays the favourites layour

import { Link, Outlet, useLocation } from 'react-router';
import BottomNav from '../BottomNav';
import CollectionPageHeader from './CollectionPageHeader';
import { paths } from '../../utils/appPaths';

const TABS = [
  { id: 'memos', label: 'Memos', to: paths.profileFavouritesMemos },
  { id: 'spots', label: 'Spots', to: paths.profileFavouritesSpots },
  { id: 'events', label: 'Events', to: paths.profileFavouritesEvents },
];

export default function FavouritesLayout() {
  const { pathname } = useLocation();

  return (
    <div className="collection-page">
      <CollectionPageHeader title="Favourites" explicitBack />

      <div className="collection-tabs" role="tablist" aria-label="Favourites categories">
        {TABS.map(tab => (
          <Link
            key={tab.id}
            to={tab.to}
            role="tab"
            aria-selected={pathname === tab.to}
            className={`collection-tab${pathname === tab.to ? ' collection-tab--active' : ''}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Outlet />

      <BottomNav />
    </div>
  );
}
