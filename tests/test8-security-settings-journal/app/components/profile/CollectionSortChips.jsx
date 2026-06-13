// this component creates a row of selectable filter/sort buttons (chips)

export default function CollectionSortChips({ options, value, onChange }) {
  return (
    <div className="collection-sort-bar" role="toolbar" aria-label="Sort and filter">
      <div className="collection-sort-track">
        {options.map(option => {
          const active = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              className={`collection-sort-chip${active ? ' collection-sort-chip--active' : ''}`}
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
