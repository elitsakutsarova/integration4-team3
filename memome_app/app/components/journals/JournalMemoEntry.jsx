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
    <svg xmlns="http://www.w3.org/2000/svg" width="27" height="37" viewBox="0 0 27 37" fill="none">
      <path d="M11.5177 0.120337C19.2915 -0.811757 25.0978 3.76937 26.0335 11.5732C26.9692 19.3769 20.1311 28.1128 15.8843 36.538C9.76611 29.3556 1.05664 22.4839 0.120951 14.6801C-0.814742 6.87635 3.74398 1.05243 11.5177 0.120337ZM12.2975 6.62349C10.5794 6.8295 9.01379 7.71222 7.94513 9.07746C6.87648 10.4427 6.39229 12.1786 6.59909 13.9034C6.80589 15.6281 7.68674 17.2004 9.04786 18.2743C10.409 19.3482 12.1389 19.8358 13.857 19.6298C15.5751 19.4238 17.1407 18.5411 18.2093 17.1758C19.278 15.8106 19.7622 14.0746 19.5554 12.3499C19.3486 10.6252 18.4677 9.05289 17.1066 7.97898C15.7455 6.90507 14.0156 6.41749 12.2975 6.62349Z" fill="#1952FF" />
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
          : <img src={url} alt={`Memo photo from ${memo.location}`} className="journal-memo-polaroid-img" />
        }
      </div>
      <p className="journal-memo-date-label">{formatMemoDay(memo.date)}</p>
    </div>
  );
}

function QuoteNote({ quote, align }) {
  return (
    <div className={`journal-memo-quote-note journal-memo-quote-note--${align}`}>
      <div className="journal-memo-quote-accent" aria-hidden="true" />
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
        <div className="journal-memo-text-container">
          <QuoteNote quote={quote} align="left" />
          <p className="journal-memo-date-label journal-memo-date-label--solo">
            {formatMemoDay(memo.date)}
          </p>
        </div>
        <LocationRow location={memo.location} align="right" />
      </article>
    );
  }

  if (layout === 'right') {
    return (
      <article className="journal-memo-entry journal-memo-entry--photo-right">
        {/* <QuoteNote quote={quote} align="left" />
        <PhotoPolaroid memo={memo} align="right" />
        <LocationRow location={memo.location} align="left" /> */}
        <PhotoPolaroid memo={memo} align="right" />
        <div className="journal-memo-content-container">
          <QuoteNote quote={quote} align="left" />
          <LocationRow location={memo.location} align="left" />
        </div>
      </article>
    );
  }

  return (
    <article className="journal-memo-entry journal-memo-entry--photo-left">
      <PhotoPolaroid memo={memo} align="left" />
      <div className="journal-memo-content-container">
        <QuoteNote quote={quote} align="right" />
        <LocationRow location={memo.location} align="right" />
      </div>
    </article>
  );
}
