import { Link } from 'react-router';
import { diaryPath, paths } from '../../utils/appPaths';
import { journalAssets } from '../../utils/journalAssets';

function truncateQuote(quote, max = 52) {
  const text = String(quote ?? '').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function PhotoStack({ photos, single = false }) {
  const primary = photos[0];
  if (!primary) return null;

  const secondary = photos[1] ?? primary;

  if (single) {
    return (
      <div className="journal-card-photos journal-card-photos--single">
        <div className="journal-card-polaroid journal-card-polaroid--front journal-card-polaroid--solo">
          <div className="journal-card-polaroid-frame">
            <img src={primary} alt="" className="journal-card-polaroid-img" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="journal-card-photos">
      <div className="journal-card-polaroid journal-card-polaroid--back">
        <div className="journal-card-polaroid-frame">
          <img src={secondary} alt="" className="journal-card-polaroid-img" />
        </div>
      </div>
      <div className="journal-card-polaroid journal-card-polaroid--front">
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
  const secondary = quotes[1] ?? primary;

  if (!primary) return null;

  return (
    <div className="journal-card-texts">
      <TextNote quote={secondary} variant="back" />
      <TextNote quote={primary} variant="front" />
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
        <PhotoStack photos={coverPhotos} single />
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
      aria-label={`${journal.title}, ${journal.monthLabel}`}
    >
      <div className="journal-card-inner">
        {journal.isActive && <NowBadge />}

        <div className={`journal-card-pocket ${pocketClass(journal.displayType)}`}>
          <div className="journal-card-pocket-shadow" aria-hidden="true" />
          <div className="journal-card-pocket-face" aria-hidden="true" />
        </div>

        <div className="journal-card-stack">
          <CardVisual journal={journal} />
        </div>

        <div className="journal-card-meta">
          <span className="journal-card-title">{journal.title}</span>
          <span className="journal-card-date">{journal.monthLabel}</span>
        </div>
      </div>
    </Link>
  );
}

export function NewJournalCard() {
  return (
    <Link to={paths.journalsCreate} className="journal-card-new" aria-label="Start a new travel diary">
      <img
        className="journal-card-new-icon"
        src={journalAssets.addMenu}
        alt=""
        aria-hidden="true"
      />
      <span className="journal-card-new-label">New Travel Diary</span>
    </Link>
  );
}
