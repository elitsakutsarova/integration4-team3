// QR code generator and testing page for the sticker collection feature

import { useState } from 'react';
import { Link, useLoaderData } from 'react-router';
import AuthLoading from '../components/auth/AuthLoading';
import QrCode from '../components/QrCode';
import { paths } from '../utils/appPaths';
import { resolveDevShareOrigin } from '../utils/devNetwork.server';
import { loadDevShareOrigin } from '../utils/devShareOrigin';

const STICKER_ART = '/physicalStickers/physicalSticker.svg';

export function meta() {
  return [
    { title: 'MemMe — Collect QR' },
    { name: 'description', content: 'Display or print the MemMe collect QR code.' },
  ];
}

export async function loader({ request }) {
  return { devShare: resolveDevShareOrigin(request) };
}

export async function clientLoader({ serverLoader }) {
  const serverData = await serverLoader();
  const clientShare = await loadDevShareOrigin();
  const devShare = clientShare.shareOrigin ? clientShare : serverData.devShare;
  return { devShare };
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return <AuthLoading />;
}

export function shouldRevalidate({ currentUrl, nextUrl }) {
  return currentUrl.pathname !== nextUrl.pathname;
}

function isLocalhostOrigin(origin) {
  try {
    const host = new URL(origin).hostname;
    return host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
}

export default function DemoStickersPage() {
  const { devShare } = useLoaderData();
  const { shareOrigin, lanUrls, isOnLocalhost } = devShare;
  const [copied, setCopied] = useState(false);
  const collectUrl = shareOrigin ? `${shareOrigin}${paths.collect}?scan=memme-collect` : '';
  const qrUsesLocalhost = isLocalhostOrigin(shareOrigin);

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
        <Link to={paths.profile} className="demo-stickers-back">← Profile</Link>
        <h1 className="demo-stickers-title">Collect sticker QR</h1>
        <p className="demo-stickers-subtitle">
          Display or print this QR — scan with a phone on the same Wi‑Fi to open the collect page.
        </p>
      </header>

      {qrUsesLocalhost && (
        <div className="demo-stickers-banner demo-stickers-banner--error" role="alert">
          <strong>QR points to localhost.</strong> Phones cannot reach that address.
          Run <code>npm run dev:lan</code> and open this page via the Network URL from your terminal
          {lanUrls[0] ? <> (e.g. <code>{lanUrls[0]}</code>)</> : null}.
        </div>
      )}

      {isOnLocalhost && !qrUsesLocalhost && lanUrls.length > 0 && (
        <div className="demo-stickers-banner" role="note">
          <strong>Dev tip:</strong> QR uses your LAN IP for phone scans.
          <span className="demo-stickers-banner-urls">
            Network URL: <code>{lanUrls[0]}</code>
          </span>
        </div>
      )}

      {shareOrigin && !qrUsesLocalhost && (
        <div className="demo-stickers-banner" role="note">
          <strong>Phone shows &ldquo;This site can&apos;t be reached&rdquo;?</strong>
          {' '}Campus/guest Wi‑Fi often blocks device-to-device traffic.
          Connect this computer to your phone&apos;s hotspot, run{' '}
          <code>npm run certs:generate</code> then <code>npm run dev:lan</code>, and open the new Network URL.
          {' '}<code>VITE_APP_ORIGIN</code> can stay as <code>https://localhost:5173</code>.
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
          First scan on a new phone? Open{' '}
          <a href={shareOrigin || '#'} className="demo-stickers-footer-link">
            {shareOrigin || 'your network URL'}
          </a>{' '}
          in the phone browser, accept the security warning, then scan the QR again.
        </p>
        <Link to={paths.stickers} className="demo-stickers-footer-link">View your collection →</Link>
      </footer>
    </div>
  );
}
