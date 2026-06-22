import { journalAssets } from '../../utils/journalAssets';

export default function CreateJournalDecorations({ title }) {
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
        <h1 className="create-journal-title">{title}</h1>
      </div>
    </header>
  );
}
