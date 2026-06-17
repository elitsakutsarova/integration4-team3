import { Link } from 'react-router';
import { paths } from '../../utils/appPaths';
import { accountAssets } from '../../utils/accountAssets';

const COPY_BY_KIND = {
  memos: 'memos',
  spots: 'spots',
  events: 'events',
};

const DISCOVER_LINK_BY_KIND = {
  memos: paths.discover,
  spots: paths.discoverPlaces,
  events: paths.discoverHappeningNow,
};

export default function FavouritesEmptyState({ kind }) {
  const label = COPY_BY_KIND[kind] ?? 'items';

  return (
    <div className="favourites-empty">
      <img
        className="favourites-empty-illustration"
        src={accountAssets.noFavouritesIllustration}
        alt=""
        aria-hidden="true"
      />

      <div className="favourites-empty-copy">
        <div className="favourites-empty-text-container">
          <h1 className="favourites-empty-title">Haven't found the hidden gems yet</h1>
          <p className="favourites-empty-text">
            Currently you haven&apos;t added any {label} to your favourites. 
            <br></br><span className="bold-text">Discover some!</span>
          </p>
        </div>
        <Link
          to={DISCOVER_LINK_BY_KIND[kind] ?? paths.discover}
          className="favourites-empty-btn"
        >
          Go to Discover
        </Link>
      </div>
    </div>
  );
}
