// popup notification modal (component) that appears when a user saves something to their favs

import { useDiscoverFaves } from '../../context/DiscoverFavesContext';
import { discoverSavedAssets } from '../../utils/discoverSavedAssets';

const SAVED_COPY = {
  event: {
    lines: ['This event is now', 'added to your'],
    highlight: 'favourite events list.',
  },
  place: {
    lines: ['This spot is now', 'added to your'],
    highlight: 'favourite spots list.',
  },
  memo: {
    lines: ['This memo is now', 'added to your'],
    highlight: 'favourite memos list.',
  },
};

export function FavouriteSavedNotice({ type, onClose }) {
  const copy = SAVED_COPY[type] ?? SAVED_COPY.place;

  return (
    <div
      className="discover-saved-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <article
        className="discover-saved-stack"
        role="dialog"
        aria-modal="true"
        aria-labelledby="discover-saved-title"
        onClick={event => event.stopPropagation()}
      >
        <img
          className="discover-saved-pin"
          src={discoverSavedAssets.pin}
          alt=""
          aria-hidden="true"
        />

        <div className="discover-saved-card">
          <div className="discover-saved-card-layout">
            <img
              className="discover-saved-doodle"
              src={discoverSavedAssets.doodle}
              alt=""
              aria-hidden="true"
            />

            <img
              className="discover-saved-grid-deco"
              src={discoverSavedAssets.gridDecoration}
              alt=""
              aria-hidden="true"
            />

            <p id="discover-saved-title" className="discover-saved-text">
              {copy.lines.map(line => (
                <span key={line} className="discover-saved-text-line">
                  {line}
                  <br />
                </span>
              ))}
              <span className="discover-saved-highlight">{copy.highlight}</span>
            </p>

            <img
              className="discover-saved-hearts"
              src={discoverSavedAssets.hearts}
              alt=""
              aria-hidden="true"
            />
          </div>
        </div>
      </article>
    </div>
  );
}

export default function DiscoverSavedModal() {
  const { savedNotice, dismissSavedNotice } = useDiscoverFaves();

  if (!savedNotice) return null;

  return <FavouriteSavedNotice type={savedNotice} onClose={dismissSavedNotice} />;
}
