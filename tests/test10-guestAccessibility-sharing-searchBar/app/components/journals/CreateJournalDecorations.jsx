import { journalAssets } from '../../utils/journalAssets';

export default function CreateJournalDecorations({ title }) {
  return (
    <header className="create-journal-hero">
      <img
        className="create-journal-hero-pixel"
        src={journalAssets.pixelDeco}
        alt=""
        aria-hidden="true"
      />
      <img
        className="create-journal-hero-wave"
        src={journalAssets.createHeaderWave}
        alt=""
        aria-hidden="true"
      />
      <img
        className="create-journal-hero-pin"
        src={journalAssets.createPixelDeco}
        alt=""
        aria-hidden="true"
      />
      <div className="create-journal-title-bar">
        <h1 className="create-journal-title">{title}</h1>
      </div>
    </header>
  );
}
