import { Link } from 'react-router';
import { diaryPath, paths } from '../../utils/appPaths';

function truncateQuote(quote, max = 52) {
  const text = String(quote ?? '').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function PhotoStack({ photos }) {
  const primary = photos[0];
  const secondary = photos[1];

  if (!primary) return null;

  return (
    <div className="journal-card-photos">
      {secondary && (
        <div className="journal-card-polaroid journal-card-polaroid--back">
          <div className="journal-card-polaroid-frame">
            <img src={secondary} alt="" className="journal-card-polaroid-img" />
          </div>
        </div>
      )}
      <div className={`journal-card-polaroid journal-card-polaroid--front${secondary ? '' : ' journal-card-polaroid--single'}`}>
        <div className="journal-card-polaroid-frame">
          <img src={primary} alt="" className="journal-card-polaroid-img" />
        </div>
      </div>
    </div>
  );
}

function TextNote({ quote, variant }) {
  if (!quote) return null;
  return (
    <div className={`journal-card-note journal-card-note--${variant}`}>
      <span>{truncateQuote(quote)}</span>
    </div>
  );
}

function TextStack({ quotes }) {
  const primary = quotes[0];
  const secondary = quotes[1];

  if (!primary) return null;

  return (
    <div className="journal-card-texts">
      {secondary && <TextNote quote={secondary} variant="back" />}
      <TextNote quote={primary} variant={secondary ? 'front' : 'single'} />
    </div>
  );
}

function CardVisual({ journal }) {
  const { displayType, coverPhotos, textQuotes } = journal;

  if (displayType === 'text-only') {
    return <TextStack quotes={textQuotes} />;
  }

  if (displayType === 'photos-text') {
    return (
      <div className="journal-card-visual journal-card-visual--mixed">
        <PhotoStack photos={coverPhotos} />
        <TextNote quote={textQuotes[0]} variant="overlay" />
      </div>
    );
  }

  return (
    <div className="journal-card-visual">
      <PhotoStack photos={coverPhotos} />
    </div>
  );
}

function pocketClass(displayType) {
  if (displayType === 'text-only') return 'journal-card-pocket--text';
  if (displayType === 'photos-text') return 'journal-card-pocket--mixed';
  return 'journal-card-pocket--photos';
}

function NowBadge() {
  return (
    <div className="journal-card-now" aria-label="Current trip">
      <span className="journal-card-now-label">Now!</span>
    </div>
  );
}

export default function JournalCard({ journal }) {
  return (
    <Link
      to={diaryPath(journal.id)}
      className={`journal-card journal-card--${journal.displayType}`}
      aria-label={`${journal.title}, ${journal.monthLabel}, ${journal.memoCount} memos`}
    >
      <div className="journal-card-stack">
        {journal.isActive && <NowBadge />}
        <CardVisual journal={journal} />
      </div>
      <div className={`journal-card-pocket ${pocketClass(journal.displayType)}`}>
        <div className="journal-card-pocket-body">
          <div className="journal-card-meta">
            <span className="journal-card-title">{journal.title}</span>
            <span className="journal-card-date">{journal.monthLabel}</span>
            <span className="journal-card-count">{journal.memoCount} memos</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function NewJournalCard() {
  return (
    <Link to={paths.home} className="journal-card-new" aria-label="Start a new travel diary">
      <span className="journal-card-new-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </span>
      <span className="journal-card-new-label">New Travel Diary</span>
    </Link>
  );
}
