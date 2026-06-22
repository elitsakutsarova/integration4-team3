import { MAP_CATEGORIES } from '../utils/mapFilters';
import MemoTagIcon from './MemoTagIcon';
import SearchOpenButton from './search/SearchOpenButton';
import { mapAssets } from '../utils/mapAssets';

export default function MapHomeChrome({
  activeCategory,
  onCategoryChange,
}) {
  return (
    <div className="map-home-chrome">
      <div className="map-pixel-deco" aria-hidden="true">
        <img className="map-pixel-grid" src={mapAssets.greenGrid} alt="Decorative pixel grid background" />
      </div>

      <div className="map-search-container">
        <SearchOpenButton className="map-search-bar map-search-bar--trigger" variant="map" />

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
  );
}
