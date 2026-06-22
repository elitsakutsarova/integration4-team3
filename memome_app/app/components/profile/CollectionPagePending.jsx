import CollectionPageHeader from './CollectionPageHeader';
import FavouritesLoading from './FavouritesLoading';

const FAVOURITES_TABS = ['Memos', 'Spots', 'Events'];

export default function CollectionPagePending({
  title = 'Favourites',
  showTabs = false,
}) {
  return (
    <div className="collection-page" aria-busy="true" aria-label={`Loading ${title}`}>
      <CollectionPageHeader title={title} explicitBack />

      {showTabs ? (
        <>
          <div className="collection-tabs" role="tablist" aria-label="Favourites categories">
            {FAVOURITES_TABS.map((label) => (
              <span key={label} className="collection-tab-wrapper">
                <span className="collection-tab" aria-selected={label === 'Memos'}>
                  {label}
                </span>
              </span>
            ))}
          </div>
          <svg
            className="collection-line"
            xmlns="http://www.w3.org/2000/svg"
            width="363"
            height="1"
            viewBox="0 0 363 1"
            fill="none"
            aria-hidden="true"
          >
            <path d="M0 0.5H363" stroke="#EFF1F5" />
          </svg>
        </>
      ) : null}

      <div className="collection-body collection-body--favourites">
        <FavouritesLoading />
      </div>
    </div>
  );
}
