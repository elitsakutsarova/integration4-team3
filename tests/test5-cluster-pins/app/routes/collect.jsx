import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import StickerVisual from '../components/diary/StickerVisual';
import { useAuth } from '../context/AuthContext';
import { useRefreshCollectedStickers } from '../context/CollectedStickersContext';
import {
  COLLECTION_COMPLETE,
  claimRandomSticker,
} from '../utils/collectibleStore';

export function meta() {
  return [{ title: 'MemMe — Collect sticker' }];
}

export default function CollectSticker() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const refreshCollected = useRefreshCollectedStickers();

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [sticker, setSticker] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    let active = true;

    async function run() {
      const result = await claimRandomSticker(user?.id ?? null);
      if (!active) return;

      if (result.error) {
        if (result.error === COLLECTION_COMPLETE) {
          setStatus('complete');
          setMessage('You collected all available stickers!');
          await refreshCollected();
          return;
        }

        setStatus('error');
        setMessage(
          typeof result.error === 'string'
            ? result.error
            : 'Could not claim sticker. Try again.',
        );
        return;
      }

      setSticker(result.sticker);
      setStatus('done');
      setMessage(
        user
          ? 'Sticker saved to your account!'
          : 'Sticker saved on this device. Create an account to keep it forever.',
      );

      await refreshCollected();
    }

    run();
    return () => { active = false; };
  }, [user?.id, authLoading, refreshCollected]);

  return (
    <div className="collect-page">
      <div className="collect-card">
        <p className="collect-eyebrow">MemMe sticker scan</p>
        <h1 className="collect-title">
          {status === 'done' && sticker
            ? 'You get a sticker!'
            : status === 'complete'
              ? 'Collection complete'
              : 'Collecting…'}
        </h1>

        {status === 'loading' && (
          <div className="auth-loading collect-loading">
            <div className="auth-loading-dot" />
            <p className="collect-loading-label">
              {authLoading ? 'Checking your account…' : 'Pulling your sticker…'}
            </p>
          </div>
        )}

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
            <Link to="/collect" className="auth-btn auth-btn--google">Scan again</Link>
          )}
          <button type="button" className="auth-btn auth-btn--google" onClick={() => navigate('/')}>
            Back to map
          </button>
        </div>
      </div>
    </div>
  );
}
