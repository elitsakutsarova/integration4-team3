import { MAP_CATEGORIES } from '../utils/mapFilters';
import MemoTagIcon from './MemoTagIcon';
import SearchOpenButton from './search/SearchOpenButton';
import MapPixelDeco from './MapPixelDeco';
import { paths } from '../utils/appPaths';

export default function MapHomeChrome({
  activeCategory,
  onCategoryChange,
  searchTo = paths.search,
}) {
  return (
    <div className="map-home-chrome">
      <MapPixelDeco className="map-pixel-deco--home-mobile" />

      <div className="map-search-container">
        <div className="map-home-toolbar">
          <SearchOpenButton
            className="map-search-bar map-search-bar--trigger"
            variant="map"
            to={searchTo}
          />

          <div className="map-category-row" role="toolbar" aria-label="Map categories">
            {MAP_CATEGORIES.map(category => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  className={`map-category-chip${isActive ? ' map-category-chip--active' : ''}`}
                  aria-pressed={isActive}
                  onClick={() => onCategoryChange(category.id)}
                >
                  {category.id !== 'All' && <MemoTagIcon tag={category.id} />}
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
