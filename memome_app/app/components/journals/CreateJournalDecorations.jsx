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
    <header className="create-journal-header">
      <div className="create-journal-hero-deco" aria-hidden="true">
        <img
          className="create-journal-hero-logo"
          src={journalAssets.logoMark}
          alt="MemoMe journals logo mark"
        />
        <img
          className="create-journal-hero-wave"
          src={journalAssets.headerWave}
          alt="Decorative wave illustration"
        />
        <img
          className="create-journal-hero-grid"
          src={journalAssets.pixelDeco}
          alt="Decorative pixel grid background"
        />
        <div className="create-journal-hero-grid-pattern grid-pattern" />
        <div className="create-journal-title-bar">
          <div className="create-journal-titles">
            {showBack && (
              <JournalBackButton
                className="create-journal-back btn-chevron"
                onClick={onBack}
                to={backTo}
                label={backLabel}
              />
            )}
            <h1 className="create-journal-title">{title}</h1>
          </div>
        </div>
      </div>
    </header>
  );
}
