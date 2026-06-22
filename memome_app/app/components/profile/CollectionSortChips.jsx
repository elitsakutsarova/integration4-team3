// this component creates a row of selectable filter/sort buttons (chips)

export default function CollectionSortChips({ options, value, onChange }) {
  return (
    <div className="collection-sort-bar" role="toolbar" aria-label="Sort and filter">
      <div className="map-category-row collection-sort-track">
        {options.map(option => {
          const active = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              className={`map-category-chip${active ? ' map-category-chip--active' : ''}`}
              aria-pressed={active}
              onClick={() => onChange(option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
