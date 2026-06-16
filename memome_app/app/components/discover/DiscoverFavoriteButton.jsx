import { useDiscoverFaves } from '../../context/DiscoverFavesContext';

export function DiscoverFavoriteButton({
  type,
  itemId,
  label,
  meta,
  className = 'discover-fave-btn',
}) {
  const { isFaved, toggleFave } = useDiscoverFaves();
  const saved = isFaved(type, itemId);

  return (
    <button
      type="button"
      className={`${className}${saved ? ' discover-fave-btn--saved' : ''}`}
      aria-label={saved ? `Remove ${label} from favorites` : `Save ${label} to favorites`}
      aria-pressed={saved}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        toggleFave(type, itemId, meta);
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          stroke="#1952ff"
          strokeWidth="1.8"
          fill={saved ? '#1952ff' : 'none'}
        />
      </svg>
    </button>
  );
}
