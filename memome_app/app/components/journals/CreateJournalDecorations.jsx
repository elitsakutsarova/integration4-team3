import { journalAssets } from '../../utils/journalAssets';
import JournalBackButton from './JournalBackButton';

export default function CreateJournalDecorations({
  title,
  onBack,
  backTo,
  backLabel = 'Back',
}) {
  const showBack = Boolean(onBack || backTo);

  return (
    <header className="create-journal-hero">
      <img
        className="create-journal-hero-pixel"
        src={journalAssets.pixelDeco}
        alt="Decorative pixel grid background"
        aria-hidden="true"
      />
      <img
        className="create-journal-hero-wave"
        src={journalAssets.createHeaderWave}
        alt="Decorative wave illustration"
        aria-hidden="true"
      />
      <img
        className="create-journal-hero-pin"
        src={journalAssets.createPixelDeco}
        alt="Decorative map pin illustration"
        aria-hidden="true"
      />
      <div className="create-journal-title-bar">
        <div className="create-journal-titles">
          {showBack && (
            <JournalBackButton
              className="create-journal-back"
              onClick={onBack}
              to={backTo}
              label={backLabel}
            />
          )}
          <h1 className="create-journal-title">{title}</h1>
        </div>
      </div>
    </header>
  );
}
