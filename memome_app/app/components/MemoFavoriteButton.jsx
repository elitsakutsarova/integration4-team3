import { useSavedMemos } from '../context/SavedMemosContext';
import { useGuestFavoriteLock } from '../hooks/useGuestFavoriteLock';

export default function MemoFavoriteButton({
  memoId,
  label,
  className = 'memory-sheet-heart',
  savedClassName = ' memory-sheet-heart--saved',
  iconSize = 22,
  strokeWidth = 1.8,
  useCurrentColor = false,
}) {
  const { isSaved, toggleMemo } = useSavedMemos();
  const { isGuest, guestLockedClass, guestStroke, activeStroke } = useGuestFavoriteLock();
  const saved = !isGuest && isSaved(memoId);
  const stroke = isGuest ? guestStroke : (useCurrentColor ? 'currentColor' : activeStroke);
  const fill = saved ? (useCurrentColor ? 'currentColor' : activeStroke) : 'none';

  return (
    <button
      type="button"
      disabled={isGuest}
      className={`${className}${saved ? savedClassName : ''}${guestLockedClass}`}
      aria-label={
        isGuest
          ? 'Log in to save favourites'
          : saved
            ? `Remove ${label} from favourites`
            : `Save ${label} to favourites`
      }
      aria-pressed={saved}
      onClick={event => {
        if (isGuest) return;
        event.preventDefault();
        event.stopPropagation();
        void toggleMemo(memoId);
      }}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill={fill}
        />
      </svg>
    </button>
  );
}
