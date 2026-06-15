import { MAP_CATEGORIES } from '../utils/mapFilters';
import SearchOpenButton from './search/SearchOpenButton';

function CategoryIcon({ id }) {
  if (id === 'Food') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M3 11h18M6 11V5a2 2 0 0 1 2-2h1v8M11 3v8M16 11V7a2 2 0 0 1 2-2h1v6" />
      </svg>
    );
  }
  if (id === 'Nightlife') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M8 22h8M12 11v11M7 11l5-8 5 8H7z" />
      </svg>
    );
  }
  if (id === 'Fashion') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M6 2l3 4h6l3-4M6 6l-2 16h16L18 6" />
      </svg>
    );
  }
  if (id === 'Art & Culture') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }
  return null;
}

export default function MapHomeChrome({
  activeCategory,
  onCategoryChange,
}) {
  return (
    <div className="map-home-chrome">
      <div className="map-pixel-deco" aria-hidden="true">
        <span /><span /><span /><span /><span /><span />
      </div>

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
              {category.id !== 'All' && <CategoryIcon id={category.id} />}
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
