import { journalAssets } from '../../utils/journalAssets';

export default function JournalsDecorations() {
  return (
    <header className="journals-hero" aria-hidden="true">
      <img
        className="journals-hero-logo"
        src={journalAssets.logoMark}
        alt=""
      />
      <img
        className="journals-hero-wave"
        src={journalAssets.headerWave}
        alt=""
      />
      <img
        className="journals-hero-pixel"
        src={journalAssets.pixelDeco}
        alt=""
      />
    </header>
  );
}
