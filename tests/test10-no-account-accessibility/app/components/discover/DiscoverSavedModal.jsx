// popup notification modal (component) that appears when a user saves something to their favs

import { useDiscoverFaves } from '../../context/DiscoverFavesContext';

export default function DiscoverSavedModal() {
  const { savedNotice, dismissSavedNotice } = useDiscoverFaves();

  if (!savedNotice) return null;

  const isEvent = savedNotice === 'event';

  return (
    <div
      className="discover-saved-backdrop"
      role="presentation"
      onClick={dismissSavedNotice}
    >
      <div
        className="discover-saved-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="discover-saved-title"
        onClick={event => event.stopPropagation()}
      >
        <div className="discover-saved-deco" aria-hidden="true">
          <svg className="discover-saved-path" viewBox="0 0 120 60" preserveAspectRatio="none">
            <path d="M0 40 C30 10, 70 50, 120 20" fill="none" stroke="#1952ff" strokeWidth="2" strokeDasharray="4 6" />
          </svg>
          <div className="discover-saved-pin-wrap">
            <div className="discover-saved-pin-shadow" />
            <svg className="discover-saved-pin" width="48" height="56" viewBox="0 0 24 32" fill="none">
              <path d="M12 1C7.03 1 3 5.03 3 10c0 7.5 9 19 9 19s9-11.5 9-19c0-4.97-4.03-9-9-9z" fill="#00b26f" stroke="#002c1c" strokeWidth="1" />
              <circle cx="12" cy="10" r="3" fill="#66ebb9" />
            </svg>
          </div>
          <div className="discover-saved-pixels" />
        </div>

        <p id="discover-saved-title" className="discover-saved-text">
          {isEvent ? 'This event is now added to your' : 'This spot is now added to your'}
          {' '}
          <span className="discover-saved-highlight">
            {isEvent ? 'favourite events list.' : 'favourite spots list.'}
          </span>
        </p>

        <div className="discover-saved-hearts" aria-hidden="true">
          <svg width="28" height="24" viewBox="0 0 28 24" fill="#1952ff">
            <rect x="0" y="8" width="4" height="4" />
            <rect x="4" y="4" width="4" height="4" />
            <rect x="8" y="0" width="4" height="4" />
            <rect x="12" y="4" width="4" height="4" />
            <rect x="16" y="8" width="4" height="4" />
            <rect x="12" y="12" width="4" height="4" />
            <rect x="8" y="16" width="4" height="4" />
            <rect x="4" y="12" width="4" height="4" />
          </svg>
          <svg width="20" height="18" viewBox="0 0 20 18" fill="#1952ff">
            <rect x="0" y="6" width="3" height="3" />
            <rect x="3" y="3" width="3" height="3" />
            <rect x="6" y="0" width="3" height="3" />
            <rect x="9" y="3" width="3" height="3" />
            <rect x="12" y="6" width="3" height="3" />
            <rect x="9" y="9" width="3" height="3" />
            <rect x="6" y="12" width="3" height="3" />
            <rect x="3" y="9" width="3" height="3" />
          </svg>
        </div>
      </div>
    </div>
  );
}
