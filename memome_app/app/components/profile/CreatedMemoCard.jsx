import { Link } from 'react-router';
import DiscoverShareIcon from '../discover/DiscoverShareIcon';
import { buildGoogleMapsDirectionsUrl, openGoogleMapsDirections } from '../../utils/googleMaps';
import { homePathWithAddMemo, paths, profileMemoEditPath } from '../../utils/appPaths';

function MemoPhoto({ memo, className }) {
  const hasMedia = Boolean(memo.mediaPreview?.url);

  if (hasMedia) {
    return memo.mediaPreview.isVideo ? (
      <video src={memo.mediaPreview.url} className={className} muted playsInline />
    ) : (
      <img src={memo.mediaPreview.url} alt="" className={className} />
    );
  }

  return (
    <div className="created-memo-card__placeholder">
      {(memo.tags ?? []).slice(0, 1).map((tag) => (
        <span key={tag} className="created-memo-card__placeholder-tag">{tag}</span>
      ))}
      <span className="created-memo-card__placeholder-label">Memo</span>
    </div>
  );
}

function MemoEditLink({ memo }) {
  if (!memo.fromDb || !memo.id) {
    const mapPath = Array.isArray(memo.ll) && memo.ll.length >= 2
      ? homePathWithAddMemo(memo.ll[0], memo.ll[1])
      : homePathWithAddMemo();

    return (
      <Link
        to={mapPath}
        className="created-memo-card__action created-memo-card__action--edit"
        aria-label={`View memo at ${memo.location} on map`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    );
  }

  return (
    <Link
      to={profileMemoEditPath(memo.id)}
      className="created-memo-card__action created-memo-card__action--edit"
      aria-label={`Edit memo at ${memo.location}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}

export default function CreatedMemoCard({ memo, onShare }) {
  const locationHref = memo.locationHref ?? null;
  const canOpenMaps = Array.isArray(memo.ll) && memo.ll.length >= 2;

  function handleTakeMeThere(event) {
    event.stopPropagation();
    if (!canOpenMaps) {
      event.preventDefault();
      return;
    }
    openGoogleMapsDirections(memo.ll[0], memo.ll[1], event);
  }

  return (
    <article className="created-memo-card">
      <div className="created-memo-card__visual">
        <div className="created-memo-card__photos">
          <div className="created-memo-card__photo created-memo-card__photo--back" aria-hidden="true">
            <MemoPhoto memo={memo} className="created-memo-card__img" />
          </div>
          <div className="created-memo-card__photo created-memo-card__photo--front">
            <MemoPhoto memo={memo} className="created-memo-card__img" />
          </div>
        </div>

        <div className="created-memo-card__toolbar">
          {onShare && (
            <button
              type="button"
              className="created-memo-card__action created-memo-card__action--share"
              aria-label={`Share memo at ${memo.location}`}
              onClick={onShare}
            >
              <DiscoverShareIcon />
            </button>
          )}
          <MemoEditLink memo={memo} />
        </div>
      </div>

      <div className="created-memo-card__quote">
        <p className="created-memo-card__quote-text">{memo.quote}</p>
      </div>

      <div className="created-memo-card__panel">
        <div className="created-memo-card__footer">
          <div className="created-memo-card__location">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            {locationHref ? (
              <Link to={locationHref} className="created-memo-card__location-link">
                {memo.location}
              </Link>
            ) : (
              <span className="created-memo-card__location-text">{memo.location}</span>
            )}
          </div>

          {canOpenMaps && (
            <a
              href={buildGoogleMapsDirectionsUrl(memo.ll[0], memo.ll[1])}
              target="_blank"
              rel="noopener noreferrer"
              className="created-memo-card__cta"
              onClick={handleTakeMeThere}
            >
              Take me there
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
