import { MAP_CATEGORIES } from '../../utils/mapFilters';
import MemoTagIcon from '../MemoTagIcon';

export default function CreatedMemoCategoryChips({ value, onChange }) {
  return (
    <div className="created-memos-category-bar" role="toolbar" aria-label="Filter by category">
      <div className="created-memos-category-track">
        {MAP_CATEGORIES.map(category => {
          const active = category.id === value;
          return (
            <button
              key={category.id}
              type="button"
              className={`map-category-chip${active ? ' map-category-chip--active' : ''}`}
              aria-pressed={active}
              onClick={() => onChange(category.id)}
            >
              {category.id !== 'All' && <MemoTagIcon tag={category.id} />}
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
