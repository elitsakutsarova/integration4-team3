// re-usable "View All" page for the Discover feature

import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { CategoryIcon, EventCard, PlaceCard } from './DiscoverCards';
import { paths } from '../../utils/appPaths';
import {
  DISCOVER_CATEGORIES,
  filterDiscoverItems,
} from '../../data/discoverContent';

function DiscoverListHeader({
  title,
  highlightWidth,
  underlined = false,
  decoration = 'none',
}) {
  return (
    <header className="discover-list-header">
      <div className="discover-list-grid-deco" aria-hidden="true">
        <img className="discover-list-grid" src="../public/discover/green-grid.svg" alt="" />
        <div className="discover-list-grid-pattern" />
      </div>
      <div className="discover-list-title-row">
        <div className="discover-list-titles">
          <Link to={paths.discover} className="discover-list-back btn-chevron" aria-label="Back to Discover">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="#1952ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <h1
            className={`discover-list-title`}
          >
            <span className="discover-section-highlight" style={{ width: highlightWidth }} aria-hidden="true" />
            {title}
          </h1>
        </div>
        <div className="discover-list-title-icon">
          {decoration === 'live' && (
            < div className="discover-list-live-star discover-detail-badge--music" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="66" height="67" viewBox="0 0 66 67" fill="none">
                <path d="M36.57 0.189809C36.9461 -0.119596 37.5003 -0.0420028 37.777 0.358794L43.7627 9.03047C43.9271 9.26876 44.2012 9.40382 44.4881 9.38796L54.9266 8.81068C55.409 8.784 55.8111 9.17767 55.8021 9.66801L55.6086 20.2772C55.6032 20.5687 55.7461 20.8419 55.9866 21.0002L64.7394 26.7604C65.1439 27.0267 65.2402 27.586 64.9491 27.9786L58.6502 36.473C58.4771 36.7064 58.4342 37.0133 58.5365 37.2853L62.2603 47.1829C62.4324 47.6403 62.1862 48.1517 61.7241 48.2966L51.7259 51.4316C51.4511 51.5177 51.2388 51.7411 51.1638 52.0229L48.4363 62.2773C48.3102 62.7513 47.8155 63.0194 47.3589 62.8612L37.4803 59.4393C37.2089 59.3453 36.9083 59.3999 36.6847 59.5839L28.5476 66.2782C28.1715 66.5876 27.6173 66.51 27.3406 66.1092L21.3549 57.4375C21.1905 57.1992 20.9164 57.0642 20.6295 57.08L10.191 57.6573C9.70856 57.684 9.30654 57.2903 9.31548 56.8L9.50904 46.1908C9.51436 45.8993 9.37153 45.6261 9.13102 45.4678L0.378216 39.7076C-0.02633 39.4413 -0.122625 38.8819 0.168503 38.4894L6.46737 29.995C6.64045 29.7616 6.68342 29.4547 6.5811 29.1827L2.8573 19.2851C2.68519 18.8277 2.9314 18.3163 3.39351 18.1714L13.3917 15.0364C13.6665 14.9503 13.8788 14.7269 13.9538 14.4451L16.6813 4.19069C16.8074 3.71674 17.3021 3.44863 17.7587 3.60678L27.6373 7.02867C27.9087 7.1227 28.2093 7.0681 28.4329 6.88414L36.57 0.189809Z" fill="#7597FF" />
              </svg>
              <span className="discover-detail-badge--icon">Live</span>
            </div>
          )}

          {decoration === 'upcoming' && (
            <div className="discover-list-arrow-deco discover-detail-badge--music" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="200" height="62" viewBox="0 0 204 66" fill="none">
                <path d="M203.713 39.0097L151.517 65.079L152.718 53.5564L-5.40902e-05 37.6478L3.92171 -1.3587e-05L156.639 15.9085L158.011 2.74246L203.713 39.0097Z" fill="#7597FF" />
              </svg>
              <span className="discover-detail-badge--icon discover-list-arrow-label">Good plans start here</span>
            </div>
          )}

          {decoration === 'places' && (
            <div className="discover-list-pin-deco discover-detail-badge--music" aria-hidden="true">
              <svg className="discover-pin-icon" xmlns="http://www.w3.org/2000/svg" width="43" height="59" viewBox="0 0 43 59" fill="none">
                <path d="M24.62 0.380988C37.0845 2.50879 43.9701 12.269 41.8341 24.7816C39.6981 37.2942 25.0976 47.679 14.652 58.773C8.47834 44.8419 -1.85009 30.2015 0.285923 17.6889C2.42194 5.17637 12.1556 -1.74681 24.62 0.380988ZM22.84 10.8081C20.0852 10.3379 17.2557 10.9854 14.9739 12.6084C12.6921 14.2313 11.1451 16.6967 10.673 19.4621C10.2009 22.2276 10.8425 25.0666 12.4566 27.3546C14.0707 29.6426 16.5252 31.1921 19.28 31.6624C22.0348 32.1327 24.8643 31.4851 27.1461 29.8622C29.4279 28.2393 30.975 25.7739 31.447 23.0084C31.9191 20.243 31.2775 17.404 29.6634 15.116C28.0493 12.828 25.5948 11.2784 22.84 10.8081Z" fill="#7597FF" />
              </svg>
            </div>

          )}
        </div>
      </div>
    </header>
  );
}

export default function DiscoverListPage({
  title,
  highlightWidth,
  underlined = false,
  decoration = 'none',
  items,
  itemType,
}) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filters = useMemo(
    () => ({ category: activeCategory, query: '' }),
    [activeCategory],
  );

  const filteredItems = useMemo(
    () => filterDiscoverItems(items, filters),
    [items, filters],
  );

  return (
    <div className="discover-list-page">
      <DiscoverListHeader
        title={title}
        highlightWidth={highlightWidth}
        underlined={underlined}
        decoration={decoration}
      />

<div className="discover-list-filters-container">
      <div className="discover-filters discover-list-filters" role="tablist" aria-label="Discover categories">
        {DISCOVER_CATEGORIES.map(category => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`discover-filter-chip${isActive ? ' discover-filter-chip--active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.icon && <CategoryIcon name={category.icon} />}
              {category.label}
            </button>
          );
        })}
      </div>
</div>
      <div className={`discover-list-content${itemType === 'place' ? ' discover-list-content--places' : ''}`}>
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            itemType === 'place'
              ? <PlaceCard key={item.id} item={item} layout="list" />
              : <EventCard key={item.id} item={item} layout="list" />
          ))
        ) : (
          <p className="discover-empty">No items match your filters.</p>
        )}
      </div>
    </div>
  );
}
