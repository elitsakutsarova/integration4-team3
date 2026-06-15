function formatMemoDay(dateLabel) {
  const text = String(dateLabel ?? '').trim();
  if (!text) return '';
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
  return text;
}

function LocationPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function PhotoPolaroid({ memo, align }) {
  const url = memo.mediaPreview?.url;
  if (!url) return null;

  return (
    <div className={`journal-memo-polaroid journal-memo-polaroid--${align}`}>
      <div className="journal-memo-polaroid-accent" aria-hidden="true" />
      <div className="journal-memo-polaroid-frame">
        {memo.mediaPreview.isVideo
          ? <video src={url} className="journal-memo-polaroid-img" muted playsInline />
          : <img src={url} alt="" className="journal-memo-polaroid-img" />
        }
      </div>
      <p className="journal-memo-date-label">{formatMemoDay(memo.date)}</p>
    </div>
  );
}

function QuoteNote({ quote, align }) {
  return (
    <div className={`journal-memo-quote-note journal-memo-quote-note--${align}`}>
      <span>{quote}</span>
    </div>
  );
}

function LocationRow({ location, align }) {
  return (
    <p className={`journal-memo-location-row journal-memo-location-row--${align}`}>
      <LocationPin />
      <span>{location}</span>
    </p>
  );
}

export default function JournalMemoEntry({ memo, layout }) {
  const hasPhoto = Boolean(memo.mediaPreview?.url);
  const quote = memo.quote?.trim() || 'A memory from this trip';

  if (!hasPhoto || layout === 'text') {
    return (
      <article className="journal-memo-entry journal-memo-entry--text">
        <QuoteNote quote={quote} align="left" />
        <p className="journal-memo-date-label journal-memo-date-label--solo">
          {formatMemoDay(memo.date)}
        </p>
        <LocationRow location={memo.location} align="right" />
      </article>
    );
  }

  if (layout === 'right') {
    return (
      <article className="journal-memo-entry journal-memo-entry--photo-right">
        <QuoteNote quote={quote} align="left" />
        <PhotoPolaroid memo={memo} align="right" />
        <LocationRow location={memo.location} align="left" />
      </article>
    );
  }

  return (
    <article className="journal-memo-entry journal-memo-entry--photo-left">
      <PhotoPolaroid memo={memo} align="left" />
      <QuoteNote quote={quote} align="right" />
      <LocationRow location={memo.location} align="right" />
    </article>
  );
}
