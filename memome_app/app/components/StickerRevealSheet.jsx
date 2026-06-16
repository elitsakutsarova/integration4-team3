import { useEffect } from 'react';
import { Link } from 'react-router';
import StickerVisual from './diary/StickerVisual';
import { paths } from '../utils/appPaths';

export default function StickerRevealSheet({ sticker, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!sticker) return null;

  return (
    <div className="sticker-reveal-overlay" role="presentation" onClick={onClose}>
      <div
        className="sticker-reveal-sheet"
        role="dialog"
        aria-labelledby="sticker-reveal-title"
        aria-modal="true"
        onClick={event => event.stopPropagation()}
      >
        <div className="sticker-reveal-sticker" aria-hidden="true">
          <div className="sticker-reveal-sticker-inner">
            <StickerVisual src={sticker.src} emoji={sticker.emoji} label={sticker.label} />
          </div>
          <div className="sticker-reveal-sticker-shadow" />
        </div>

        <div className="sticker-reveal-card">
          <p id="sticker-reveal-title" className="sticker-reveal-title">
            New sticker unlocked!
          </p>
          <div className="sticker-reveal-actions">
            <button
              type="button"
              className="sticker-reveal-btn sticker-reveal-btn--ghost"
              onClick={onClose}
            >
              Close
            </button>
            <Link
              to={paths.stickers}
              className="sticker-reveal-btn sticker-reveal-btn--primary"
              onClick={onClose}
            >
              View in collection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
