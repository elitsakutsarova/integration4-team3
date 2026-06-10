import { useCallback, useState } from 'react';
import { href, Link, useLoaderData } from 'react-router';
import QrCode from '../components/QrCode';
import { loadDevShareOrigin } from '../utils/devShareOrigin';

const STICKER_ART = '/physicalStickers/physicalSticker.svg';

export function meta() {
  return [
    { title: 'MemMe — Collect QR' },
    { name: 'description', content: 'Display or print the MemMe collect QR code.' },
  ];
}

export async function clientLoader() {
  return { devShare: await loadDevShareOrigin() };
}

clientLoader.hydrate = true;

export default function DemoStickersPage() {
  const { devShare } = useLoaderData();
  const { shareOrigin, lanUrls, isOnLocalhost } = devShare;
  const [copied, setCopied] = useState(false);
  const collectUrl = shareOrigin ? `${shareOrigin}${href('/collect')}?scan=memme-collect` : '';

  async function copyLink() {
    if (!collectUrl) return;
    try {
      await navigator.clipboard.writeText(collectUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="demo-stickers-page">
      <header className="demo-stickers-header">
        <Link to="/profile" className="demo-stickers-back">← Profile</Link>
        <h1 className="demo-stickers-title">Collect sticker QR</h1>
        <p className="demo-stickers-subtitle">
          Display or print this QR — scan with a phone on the same Wi‑Fi to open the collect page.
        </p>
      </header>

      {isOnLocalhost && (
        <div className="demo-stickers-banner" role="note">
          <strong>Dev tip:</strong> run <code>npm run dev:lan</code> so QR codes use your LAN IP, not localhost.
          {lanUrls.length > 0 && (
            <span className="demo-stickers-banner-urls">
              {' '}Network URL: <code>{lanUrls[0]}</code>
            </span>
          )}
        </div>
      )}

      {!shareOrigin && (
        <p className="demo-stickers-loading">Resolving network URL for QR codes…</p>
      )}

      <div className="demo-stickers-grid">
        <article className="demo-physical-sticker">
          <div className="demo-physical-sticker-art">
            <img src={STICKER_ART} alt="" className="demo-physical-sticker-frame" />
            <div className="demo-physical-sticker-qr">
              <QrCode
                value={collectUrl}
                size={148}
                label="Collect a random MemMe sticker"
              />
            </div>
          </div>
          <h2 className="demo-physical-sticker-name">MemMe Collect</h2>
          <p className="demo-physical-sticker-desc">
            Each scan gives one random sticker you do not own yet — up to 3 in the collection.
          </p>
          <div className="demo-physical-sticker-actions">
            <a
              href={collectUrl}
              className="demo-physical-sticker-btn demo-physical-sticker-btn--primary"
              target="_blank"
              rel="noreferrer"
            >
              Open collect page
            </a>
            <button
              type="button"
              className="demo-physical-sticker-btn"
              onClick={copyLink}
              disabled={!collectUrl}
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
          {collectUrl && (
            <p className="demo-physical-sticker-url">
              <code>{collectUrl}</code>
            </p>
          )}
        </article>
      </div>

      <footer className="demo-stickers-footer">
        <p>
          First scan on a new device? Trust the self-signed certificate once, then scan again.
        </p>
        <Link to="/stickers" className="demo-stickers-footer-link">View your collection →</Link>
      </footer>
    </div>
  );
}
