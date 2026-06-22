import {
  RECAP_ASSETS,
  RECAP_SLOTS,
  buildRecapSubtitle,
  formatRecapMemoDay,
  getRecapStyle,
  splitJournalTitle,
} from '../../utils/recapTemplates';

/** A polaroid-style photo tile matching the Figma Instagram story layout */
function PhotoTile({ memo, slot }) {
  const quote = memo?.quote?.trim() || 'A memory from this trip';
  const day = formatRecapMemoDay(memo?.date);
  const photoSrc = memo?.mediaPreview?.url;
  const frameRot = slot.tilt === 'left' ? -7.37 : 5.97;

  return (
    <div className={`rtc-photo-tile rtc-photo-tile--${slot.tilt}`}>
      <div className="rtc-polaroid">
        {/* Colored accent block behind the polaroid */}
        <div className="rtc-polaroid-accent" style={{ background: slot.accentBg }} aria-hidden="true" />
        {/* White polaroid frame */}
        <div className="rtc-polaroid-frame" style={{ transform: `rotate(${frameRot}deg)` }}>
          {photoSrc
            ? <img src={photoSrc} alt={`Recap photo from ${memo?.location || 'this trip'}`} className="rtc-polaroid-img" />
            : <div className="rtc-polaroid-placeholder" />
          }
        </div>
        {day ? (
          <span className="rtc-polaroid-date" style={{ transform: `rotate(${frameRot}deg)` }}>{day}</span>
        ) : null}
      </div>
      {/* Caption strip */}
      <div
        className="rtc-photo-caption"
        style={{ background: slot.captionBg, transform: `rotate(${slot.captionRot}deg)` }}
      >
        {quote}
      </div>
    </div>
  );
}

/**
 * Compact horizontal quote tile matching the Figma design (~46px tall).
 * Has a wide colored strip at the top with a caption box overlaid.
 */
function QuoteTile({ memo, slot }) {
  const quote = memo?.quote?.trim() || 'A memory from this trip';
  const day = formatRecapMemoDay(memo?.date);

  return (
    <div className="rtc-quote-tile">
      <div className="rtc-quote-body">
        <div className="rtc-quote-strip" style={{ background: slot.accentBg }} aria-hidden="true" />
        <div
          className="rtc-quote-caption"
          style={{ background: slot.captionBg, transform: `rotate(${slot.captionRot}deg)` }}
        >
          <p>{quote}</p>
        </div>
      </div>
      {day ? <span className="rtc-quote-date">{day}</span> : null}
    </div>
  );
}

function RecapTile({ memo, index }) {
  const slot = RECAP_SLOTS[index % RECAP_SLOTS.length];
  if (slot.type === 'quote' || !memo?.mediaPreview?.url) {
    return <QuoteTile memo={memo} slot={slot} />;
  }
  return <PhotoTile memo={memo} slot={slot} />;
}

export default function RecapTemplateCard({
  journal,
  memories,
  styleId,
  compact = false,
  exportRef = null,
}) {
  const style = getRecapStyle(styleId);
  const titleParts = splitJournalTitle(journal.title);
  const subtitle = buildRecapSubtitle(journal);
  const tiles = memories.slice(0, 9);

  return (
    <article
      ref={exportRef}
      className={`rtc-card${compact ? ' rtc-card--compact' : ''}`}
      data-recap-style={style.id}
      style={{
        '--rtc-frame-bg': style.frameBg,
        '--rtc-frame-border': style.frameBorder,
        '--rtc-subtitle-border': style.subtitleBorder,
        '--rtc-subtitle-text': style.subtitleText,
      }}
    >
      {/* Green-bordered outer frame */}
      <div className="rtc-frame">

        {/* Grid dot background – covers upper portion */}
        <img src={RECAP_ASSETS.grid} alt="Decorative pixel grid background" className="rtc-grid-bg" aria-hidden="true" />

        {/* Pixel corner decoration – clips slightly outside top-left */}
        <div className="rtc-pixel-corner" aria-hidden="true">
          <img src={RECAP_ASSETS.pixelCorner} alt="Decorative pixel corner" />
        </div>

        {/* "This could be YOU!" star sticker */}
        <div className="rtc-star-sticker" aria-hidden="true">
          <div className="rtc-star-sticker-inner">
            <img src={RECAP_ASSETS.starUnion} alt="Decorative star outline" className="rtc-star-union" />
            <img src={RECAP_ASSETS.starInner} alt="Decorative star fill" className="rtc-star-inner" />
            <span className="rtc-star-label-top">This could be</span>
            <span className="rtc-star-label-bottom">YOU!</span>
          </div>
        </div>

        {/* Title chips ("Weekends / Getaway") */}
        <div className="rtc-title-group">
          <span className="rtc-title-chip rtc-title-chip--top">{titleParts.top}</span>
          <img src={RECAP_ASSETS.mapPin} alt="Decorative map pin" className="rtc-map-pin" aria-hidden="true" />
          <span className="rtc-title-chip rtc-title-chip--bottom">{titleParts.bottom}</span>
        </div>

        {/* White inner sheet */}
        <div className="rtc-sheet">

          {/* Subtitle in dashed border box */}
          <div className="rtc-subtitle-box">
            <span className="rtc-subtitle-corner rtc-subtitle-corner--tl" aria-hidden="true" />
            <span className="rtc-subtitle-corner rtc-subtitle-corner--tr" aria-hidden="true" />
            <span className="rtc-subtitle-corner rtc-subtitle-corner--bl" aria-hidden="true" />
            <span className="rtc-subtitle-corner rtc-subtitle-corner--br" aria-hidden="true" />
            <p className="rtc-subtitle-text">{subtitle}</p>
          </div>

          {/* Memo collage — only selected memos, no empty placeholders */}
          <div className="rtc-collage">
            {Array.from({ length: Math.ceil(tiles.length / 3) }, (_, row) => (
              <div key={row} className="rtc-row">
                {[0, 1, 2].map((col) => {
                  const index = row * 3 + col;
                  const memo = tiles[index];
                  if (!memo) return <div key={col} className="rtc-cell rtc-cell--empty" aria-hidden="true" />;
                  return <RecapTile key={col} memo={memo} index={index} />;
                })}
              </div>
            ))}
          </div>

          {/* Memo me logo */}
          <div className="rtc-logo" aria-hidden="true">
            <img src={RECAP_ASSETS.memoSubtract} alt="MemoMe logo mark" className="rtc-logo-icon" />
            <div className="rtc-logo-text">
              <span>Memo</span>
              <span>me</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
