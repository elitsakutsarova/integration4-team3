import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import QrCode from '../components/QrCode';
import { useDevShareOrigin } from '../utils/devShareOrigin';

export function meta() {
  return [
    { title: 'MemMe — Demo physical stickers' },
    { name: 'description', content: 'Print or display QR stickers for Wi‑Fi collect testing.' },
  ];
}

function spotLabel(name) {
  const parts = name.split('—');
  return parts.length > 1 ? parts[parts.length - 1].trim() : name;
}

export default function DemoStickersPage() {
  const { shareOrigin, lanUrls, isOnLocalhost, ready } = useDevShareOrigin();
  const [locations, setLocations] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetch('/physicalStickers/locations.json', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setLocations(Array.isArray(data) ? data.filter(l => l.active !== false) : []))
      .catch(() => setLocations([]));
  }, []);

  const collectUrl = useCallback(
    locationId => (shareOrigin ? `${shareOrigin}/collect/${locationId}` : ''),
    [shareOrigin],
  );

  async function copyLink(locationId) {
    const url = collectUrl(locationId);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(locationId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="demo-stickers-page">
      <header className="demo-stickers-header">
        <Link to="/profile" className="demo-stickers-back">← Profile</Link>
        <h1 className="demo-stickers-title">Physical sticker QRs</h1>
        <p className="demo-stickers-subtitle">
          Display these on your laptop or print them — scan with any phone on the same Wi‑Fi to open the collect page.
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

      {!ready && (
        <p className="demo-stickers-loading">Resolving network URL for QR codes…</p>
      )}

      <div className="demo-stickers-grid">
        {locations.map(loc => {
          const url = collectUrl(loc.id);
          return (
            <article key={loc.id} className="demo-physical-sticker">
              <div className="demo-physical-sticker-art">
                <img src={loc.image} alt="" className="demo-physical-sticker-frame" />
                <div className="demo-physical-sticker-qr">
                  <QrCode
                    value={url}
                    size={148}
                    label={`Collect sticker at ${loc.name}`}
                  />
                </div>
              </div>
              <h2 className="demo-physical-sticker-name">{spotLabel(loc.name)}</h2>
              <p className="demo-physical-sticker-desc">{loc.description}</p>
              <div className="demo-physical-sticker-actions">
                <a
                  href={url}
                  className="demo-physical-sticker-btn demo-physical-sticker-btn--primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open collect page
                </a>
                <button
                  type="button"
                  className="demo-physical-sticker-btn"
                  onClick={() => copyLink(loc.id)}
                  disabled={!url}
                >
                  {copiedId === loc.id ? 'Copied!' : 'Copy link'}
                </button>
              </div>
              {url && (
                <p className="demo-physical-sticker-url">
                  <code>{url}</code>
                </p>
              )}
            </article>
          );
        })}
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
