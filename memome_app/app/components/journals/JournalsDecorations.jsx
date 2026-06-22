import { journalAssets } from '../../utils/journalAssets';

export default function JournalsDecorations() {
  return (
    <header className="journals-hero" aria-hidden="true">
      <img
        className="journals-hero-logo"
        src={journalAssets.logoMark}
        alt="MemoMe journals logo mark"
      />
      <img
        className="journals-hero-wave"
        src={journalAssets.headerWave}
        alt="Decorative wave illustration"
      />
      <img
        className="journals-hero-pixel"
        src={journalAssets.pixelDeco}
        alt="Decorative pixel grid background"
      />
    </header>
  );
}
