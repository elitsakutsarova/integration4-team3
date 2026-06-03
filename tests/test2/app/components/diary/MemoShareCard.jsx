import { loadPageStickers } from '../../utils/stickerTracker';

export default function MemoShareCard({ memory, pageIndex, diaryId, selected, onToggle, compact }) {
  const stickers = typeof window !== 'undefined'
    ? loadPageStickers(diaryId, pageIndex)
    : [];

  return (
    <button
      type="button"
      className={`share-memo-card${selected ? ' share-memo-card--selected' : ''}${compact ? ' share-memo-card--compact' : ''}`}
      onClick={onToggle}
    >
      <span className={`share-memo-radio${selected ? ' share-memo-radio--on' : ''}`} aria-hidden="true" />
      <p className="share-memo-date">{memory.date}</p>
      <div className="share-memo-polaroid">
        <span className="diary-corner diary-corner--tl" aria-hidden="true" />
        <span className="diary-corner diary-corner--br" aria-hidden="true" />
        <div className="share-memo-photo">
          {stickers.map(s => (
            <span
              key={s.uid}
              className="share-memo-sticker"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              {s.emoji}
            </span>
          ))}
        </div>
      </div>
      <p className="share-memo-quote">&ldquo;{memory.quote}&rdquo;</p>
      <p className="share-memo-location">At: {memory.location}</p>
    </button>
  );
}

export function ShareWholeDiaryCard({ onCreateRecap, onCopyLink }) {
  return (
    <div className="share-whole-card">
      <h3 className="share-whole-title">Share whole diary?</h3>
      <button type="button" className="share-whole-recap-btn" onClick={onCreateRecap}>
        Create recap of trip
      </button>
      <button type="button" className="share-whole-link-btn" onClick={onCopyLink}>
        Copy link to diary
      </button>
    </div>
  );
}

export function StickerOverlay({ pageIndex, diaryId }) {
  const stickers = typeof window !== 'undefined'
    ? loadPageStickers(diaryId, pageIndex)
    : [];
  if (!stickers.length) return null;
  return (
    <>
      {stickers.map(s => (
        <span
          key={s.uid}
          className="share-render-sticker"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          data-sticker-id={s.stickerId}
          data-x={s.x}
          data-y={s.y}
        >
          {s.emoji}
        </span>
      ))}
    </>
  );
}
