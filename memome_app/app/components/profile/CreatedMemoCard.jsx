import { Link } from 'react-router';
import DiscoverShareIcon from '../discover/DiscoverShareIcon';
import MemoFavoriteButton from '../MemoFavoriteButton';
import MemorySheet from '../MemorySheet';
import { homePathWithAddMemo, profileMemoEditPath } from '../../utils/appPaths';

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

function CreatedMemoActions({ memo, onShare, showEdit, showFavorite }) {
  return (
    <>
      {onShare ? (
        <button
          type="button"
          className="created-memo-card__action created-memo-card__action--share"
          aria-label={`Share memo at ${memo.location}`}
          onClick={onShare}
        >
          <DiscoverShareIcon />
        </button>
      ) : (
        <span aria-hidden="true" />
      )}
      {showFavorite ? (
        <MemoFavoriteButton
          memoId={memo.id}
          label={memo.location}
          className="created-memo-card__action created-memo-card__action--favorite"
          savedClassName=" created-memo-card__action--favorite-saved"
          useCurrentColor
        />
      ) : showEdit ? (
        <MemoEditLink memo={memo} />
      ) : null}
    </>
  );
}

export default function CreatedMemoCard({
  memo,
  onShare,
  showEdit = true,
  showFavoriteInsteadOfEdit = false,
}) {
  const actions = (
    <CreatedMemoActions
      memo={memo}
      onShare={onShare}
      showEdit={!showFavoriteInsteadOfEdit && showEdit}
      showFavorite={showFavoriteInsteadOfEdit}
    />
  );

  return (
    <article className="created-memo-card">
      <MemorySheet
        embedded
        pin={memo}
        locationHref={memo.locationHref ?? null}
        actions={actions}
      />
    </article>
  );
}
