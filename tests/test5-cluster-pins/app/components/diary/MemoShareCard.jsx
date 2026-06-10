import { getStickerDef } from '../../utils/stickers';
import { getStickersForPage, subscribeStickerLayouts } from '../../utils/stickerTracker';
import { useDiaryStickerCatalog } from '../../hooks/useDiaryStickerCatalog';
import StickerVisual from './StickerVisual';
import { useEffect, useState } from 'react';

function PlacedStickerPreview({ sticker, stickerCatalog }) {
  const def = getStickerDef(sticker.stickerId, stickerCatalog);
  return (
    <span
      className="share-memo-sticker"
      style={{ left: `${sticker.x}%`, top: `${sticker.y}%` }}
    >
      <StickerVisual
        src={sticker.src ?? def?.src}
        emoji={sticker.emoji ?? def?.emoji}
        label={def?.label ?? sticker.label}
      />
    </span>
  );
}

export default function MemoShareCard({
  memory,
  pageIndex,
  diaryId,
  selected,
  onToggle,
  compact,
  pageLayout,
}) {
  const stickerCatalog = useDiaryStickerCatalog();
  const [stickers, setStickers] = useState(() =>
    getStickersForPage(diaryId, pageIndex, pageLayout),
  );

  useEffect(() => {
    setStickers(getStickersForPage(diaryId, pageIndex, pageLayout));
  }, [diaryId, pageIndex, pageLayout]);

  useEffect(() => {
    return subscribeStickerLayouts((changedDiaryId, changedPage) => {
      if (changedDiaryId !== diaryId) return;
      if (Number(changedPage) !== Number(pageIndex)) return;
      setStickers(getStickersForPage(diaryId, pageIndex, pageLayout));
    });
  }, [diaryId, pageIndex, pageLayout]);

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
            <PlacedStickerPreview key={s.uid} sticker={s} stickerCatalog={stickerCatalog} />
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

export function StickerOverlay({ pageIndex, diaryId, pageLayout }) {
  const stickerCatalog = useDiaryStickerCatalog();
  const stickers = getStickersForPage(diaryId, pageIndex, pageLayout);
  if (!stickers.length) return null;
  return (
    <>
      {stickers.map(s => (
        <PlacedStickerPreview key={s.uid} sticker={s} stickerCatalog={stickerCatalog} />
      ))}
    </>
  );
}
