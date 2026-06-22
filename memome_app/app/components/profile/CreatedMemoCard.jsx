import { Link } from 'react-router';
import DiscoverShareIcon from '../discover/DiscoverShareIcon';
import MemoFavoriteButton from '../MemoFavoriteButton';
import MemorySheet from '../MemorySheet';
import { homePathWithAddMemo, profileMemoEditPath } from '../../utils/appPaths';

function MemoEditLink({ memo, returnTo = null }) {
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
      to={profileMemoEditPath(memo.id, returnTo)}
      state={returnTo ? { editReturnTo: returnTo } : undefined}
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

function MemoRemoveButton({ memo, onRemove }) {
  return (
    <button
      type="button"
      className="created-memo-card__action created-memo-card__action--remove"
      aria-label={`Remove memo at ${memo.location} from journal`}
      onClick={(event) => {
        event.stopPropagation();
        onRemove?.();
      }}
    >
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function CreatedMemoActions({
  memo,
  onShare,
  showEdit,
  showFavorite,
  onRemove,
  editReturnTo = null,
}) {
  if (onRemove) {
    return (
      <>
        <span aria-hidden="true" />
        <MemoRemoveButton memo={memo} onRemove={onRemove} />
      </>
    );
  }

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
        <MemoEditLink memo={memo} returnTo={editReturnTo} />
      ) : null}
    </>
  );
}

export default function CreatedMemoCard({
  memo,
  onShare,
  onRemove,
  showEdit = true,
  showFavoriteInsteadOfEdit = false,
  responsiveScale = false,
  editReturnTo = null,
}) {
  const actions = (
    <CreatedMemoActions
      memo={memo}
      onShare={onShare}
      onRemove={onRemove}
      showEdit={!showFavoriteInsteadOfEdit && showEdit}
      showFavorite={showFavoriteInsteadOfEdit}
      editReturnTo={editReturnTo}
    />
  );

  return (
    <article className="created-memo-card">
      <MemorySheet
        embedded
        responsiveScale={responsiveScale}
        pin={memo}
        locationHref={memo.locationHref ?? null}
        actions={actions}
      />
    </article>
  );
}
