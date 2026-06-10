import { href, Link, useLoaderData } from 'react-router';
import StickerVisual from '../components/diary/StickerVisual';
import { useAuth } from '../context/AuthContext';
import {
  COLLECTION_COMPLETE,
  claimRandomSticker,
} from '../utils/collectibleStore';
import { revalidateRoot } from '../utils/revalidateRoot';

export function meta() {
  return [{ title: 'MemMe — Collect sticker' }];
}

export async function clientLoader() {
  const result = await claimRandomSticker(null);
  if (!result.error || result.error === COLLECTION_COMPLETE) {
    revalidateRoot();
  }
  return { result };
}

clientLoader.hydrate = true;

function claimStatus(result) {
  if (result.error === COLLECTION_COMPLETE) return 'complete';
  if (result.error) return 'error';
  if (result.sticker) return 'done';
  return 'error';
}

function claimMessage(result, isLoggedIn) {
  if (result.error === COLLECTION_COMPLETE) {
    return 'You collected all available stickers!';
  }
  if (result.error) {
    return typeof result.error === 'string'
      ? result.error
      : 'Could not claim sticker. Try again.';
  }
  return isLoggedIn
    ? 'Sticker saved to your account!'
    : 'Sticker saved on this device. Create an account to keep it forever.';
}

function claimTitle(status, sticker) {
  if (status === 'done' && sticker) return 'You get a sticker!';
  if (status === 'complete') return 'Collection complete';
  return 'Collect failed';
}

export default function CollectSticker() {
  const { result } = useLoaderData();
  const { user } = useAuth();

  const status = claimStatus(result);
  const message = claimMessage(result, Boolean(user));
  const sticker = result.sticker ?? null;

  return (
    <div className="collect-page">
      <div className="collect-card">
        <p className="collect-eyebrow">MemMe sticker scan</p>
        <h1 className="collect-title">{claimTitle(status, sticker)}</h1>

        {status === 'error' && (
          <div className="auth-banner auth-banner--warning" role="alert">
            {message}
          </div>
        )}

        {status === 'complete' && (
          <div className="auth-banner auth-banner--success" role="status">
            {message}
          </div>
        )}

        {status === 'done' && sticker && (
          <>
            <div className="auth-banner auth-banner--success" role="status">
              {message}
            </div>
            <div className="collect-reveal collect-reveal--celebrate">
              <p className="collect-reveal-label">Your digital collectible</p>
              <div className="collect-sticker-showcase">
                <StickerVisual src={sticker.src} label={sticker.label} />
              </div>
              <p className="collect-sticker-name">{sticker.label}</p>
            </div>
          </>
        )}

        <div className="collect-actions">
          {user ? (
            <Link to="/stickers" className="auth-btn auth-btn--primary">View my stickers</Link>
          ) : (
            <>
              <Link to="/register" className="auth-btn auth-btn--primary">Create account to save</Link>
              <Link to="/login" className="auth-btn auth-btn--google">Log in</Link>
            </>
          )}
          {status === 'done' && (
            <Link to={href('/collect')} className="auth-btn auth-btn--google">Scan again</Link>
          )}
          <Link to="/" className="auth-btn auth-btn--google">Back to map</Link>
        </div>
      </div>
    </div>
  );
}
