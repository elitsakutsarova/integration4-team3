import '../styles/modules/collect.css';
import '../styles/modules/auth.css';
// collect a sticker page
// when the user scans a sticker QR code, it automatically gives them a random digital sticker and show them the result

import { useEffect } from 'react';
import { Link, redirect, useLoaderData, useNavigate, useRevalidator } from 'react-router';
import StickerVisual from '../components/diary/StickerVisual';
import { useAuth } from '../context/AuthContext';
import { useCollectedStickersActions } from '../context/CollectedStickersContext';
import {
  COLLECTION_COMPLETE,
  claimRandomSticker,
  hydrateCollectResult,
} from '../utils/collectibleStore';
import {
  getScanKey,
  readCollectCache,
  writeCollectCache,
} from '../utils/collectClaimCache';
import * as authStore from '../utils/authStore';
import { collectScanPath, paths } from '../utils/appPaths';
import { markPhysicalStickerScanned } from '../utils/achievementProgressStore';
import { writeStickerReveal } from '../utils/stickerReveal';

export function meta() {
  return [{ title: 'MemMe — Collect sticker' }];
}

function isGuestSession(sessionUser) {
  return !sessionUser?.id;
}

// Open page → claim once per ?scan= key (cached in sessionStorage so refresh does not re-claim).
export async function clientLoader({ request }) {
  const session = await authStore.getSession();

  const scan = getScanKey(request);
  const cached = readCollectCache(scan);
  if (cached) {
    const result = await hydrateCollectResult(cached);
    writeCollectCache(scan, result);
    if (result.sticker) {
      markPhysicalStickerScanned(session?.id ?? 'guest');
    }
    // Cached = this scan key was already processed in this browser session.
    // Guests always go to the map; don't re-show the popup (sticker already revealed).
    if (isGuestSession(session)) throw redirect(paths.home);
    return { scan, result };
  }

  const result = await hydrateCollectResult(await claimRandomSticker(session));
  writeCollectCache(scan, result);

  if (result.sticker) {
    markPhysicalStickerScanned(session?.id ?? 'guest');
  }

  if (isGuestSession(session)) {
    // Fresh claim — write the reveal popup only if a new sticker was earned.
    if (result.sticker) writeStickerReveal(result.sticker);
    throw redirect(paths.home);
  }

  return { scan, result, shouldRevalidateRoot: Boolean(result.sticker) };
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return (
    <div className="collect-page">
      <div className="collect-card" />
    </div>
  );
}

/**
 * Only re-run the claim when this route's URL changes (e.g. ?scan= for rescan).
 * Root loader revalidation (login, sticker sync) must not re-claim here — that
 * caused an infinite revalidation loop and would duplicate claims on revisit.
 * Login while on this page is rare; navigating away and back re-runs the loader.
 */
export function shouldRevalidate({ currentUrl, nextUrl }) {
  return (
    currentUrl.pathname !== nextUrl.pathname
    || currentUrl.search !== nextUrl.search
  );
}

function resolveClaimDisplay(result, isLoggedIn) {
  if (result.error === COLLECTION_COMPLETE) {
    return {
      status: 'complete',
      title: 'Collection complete',
      message: 'You collected all available stickers!',
    };
  }
  if (result.error) {
    return {
      status: 'error',
      title: 'Collect failed',
      message: typeof result.error === 'string'
        ? result.error
        : 'Could not claim sticker. Try again.',
    };
  }
  if (result.sticker) {
    return {
      status: 'done',
      title: 'You get a sticker!',
      message: isLoggedIn
        ? 'Sticker saved to your account!'
        : 'Sticker saved on this device. Create an account to keep it forever.',
    };
  }
  return {
    status: 'error',
    title: 'Collect failed',
    message: 'Could not claim sticker. Try again.',
  };
}

export default function CollectSticker() {
  const { result, shouldRevalidateRoot } = useLoaderData();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { revalidate } = useRevalidator();
  const { addCollectedSticker } = useCollectedStickersActions();
  const display = resolveClaimDisplay(result, Boolean(user));

  useEffect(() => {
    if (!result.sticker) return;
    addCollectedSticker(result.sticker);
    if (shouldRevalidateRoot) revalidate();
  }, [result.sticker, shouldRevalidateRoot, addCollectedSticker, revalidate]);

  function handleScanAgain() {
    navigate(collectScanPath(Date.now()));
  }

  return (
    <div className="collect-page">
      <div className="collect-card">
        <p className="collect-eyebrow">MemMe sticker scan</p>
        <h1 className="collect-title">{display.title}</h1>

        {display.status === 'error' && (
          <div className="auth-banner auth-banner--warning" role="alert">
            {display.message}
          </div>
        )}

        {display.status === 'complete' && (
          <div className="auth-banner auth-banner--success" role="status">
            {display.message}
          </div>
        )}

        {display.status === 'done' && (
          <>
            <div className="auth-banner auth-banner--success" role="status">
              {display.message}
            </div>
            <div className="collect-reveal collect-reveal--celebrate">
              <p className="collect-reveal-label">Your digital collectible</p>
              <div className="collect-sticker-showcase">
                <StickerVisual src={result.sticker.src} label={result.sticker.label} />
              </div>
              <p className="collect-sticker-name">{result.sticker.label}</p>
            </div>
          </>
        )}

        <div className="collect-actions">
          {user ? (
            <Link to={paths.stickers} className="auth-btn auth-btn--primary">View my stickers</Link>
          ) : (
            <>
              <Link to={paths.register} className="auth-btn auth-btn--primary">Create account to save</Link>
              <Link to={paths.login} className="auth-btn auth-btn--google">Log in</Link>
            </>
          )}
          {display.status === 'done' && (
            <button
              type="button"
              className="auth-btn auth-btn--google"
              onClick={handleScanAgain}
            >
              Scan again
            </button>
          )}
          <Link to={paths.home} className="auth-btn auth-btn--google">Back to map</Link>
        </div>
      </div>
    </div>
  );
}
