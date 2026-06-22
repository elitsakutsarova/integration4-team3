// this component displays the favourites layour

import { NavLink, Outlet } from 'react-router';
import BottomNav from '../BottomNav';
import CollectionPageHeader from './CollectionPageHeader';
import { paths } from '../../utils/appPaths';

const TABS = [
  { id: 'memos', label: 'Memos', to: paths.profileFavouritesMemos },
  { id: 'spots', label: 'Spots', to: paths.profileFavouritesSpots },
  { id: 'events', label: 'Events', to: paths.profileFavouritesEvents },
];

function CollectionTab({ tab }) {
  return (
    <NavLink
      to={tab.to}
      end
      role="tab"
      className={({ isActive }) =>
        `collection-tab-wrapper${isActive ? ' collection-tab-wrapper--active' : ''}`
      }
    >
      {({ isActive }) => (
        <span className="collection-tab" aria-selected={isActive}>
          {tab.label}
        </span>
      )}
    </NavLink>
  );
}

export default function FavouritesLayout({ outletContext }) {
  return (
    <div className="collection-page">
      <CollectionPageHeader title="Favourites" explicitBack />

      {/* <div className="collection-tabs" role="tablist" aria-label="Favourites categories">
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
      </div> */}

      <div className="collection-tabs" role="tablist" aria-label="Favourites categories">
        {TABS.map(tab => (
          <CollectionTab key={tab.id} tab={tab} />
        ))}
      </div>
      <svg className="collection-line" xmlns="http://www.w3.org/2000/svg" width="363" height="1" viewBox="0 0 363 1" fill="none">
        <path d="M0 0.5H363" stroke="#EFF1F5" />
      </svg>
      <div className="collection-body collection-body--favourites">
        <Outlet context={outletContext} />
      </div>

      <BottomNav />
    </div>
  );
}
