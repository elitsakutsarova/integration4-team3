import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import StickerVisual from '../components/diary/StickerVisual';
import { useAuth } from '../context/AuthContext';
import { useRefreshCollectedStickers } from '../context/CollectedStickersContext';
import { claimPhysicalSticker, getLocation } from '../utils/collectibleStore';

export function meta() {
  return [{ title: 'MemMe — Collect sticker' }];
}

export default function CollectSticker() {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const refreshCollected = useRefreshCollectedStickers();

  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [sticker, setSticker] = useState(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  useEffect(() => {
    let active = true;

    async function run() {
      const loc = await getLocation(locationId);
      if (!active) return;

      if (!loc) {
        setStatus('error');
        setMessage('This QR code is not linked to a valid MemMe spot.');
        return;
      }

      setLocation(loc);

      const result = await claimPhysicalSticker(locationId, user?.id ?? null);
      if (!active) return;

      if (result.error) {
        setStatus('error');
        setMessage(
          result.error === 'unknown_location'
            ? 'Unknown sticker location.'
            : 'Could not claim sticker. Try again.',
        );
        return;
      }

      setSticker(result.sticker);
      setAlreadyClaimed(Boolean(result.alreadyClaimed));
      setStatus('done');
      setMessage(
        result.alreadyClaimed
          ? 'You already collected a sticker from this spot.'
          : user
            ? 'Sticker saved to your account!'
            : 'Sticker saved on this device. Create an account to keep it forever.',
      );

      await refreshCollected();
    }

    run();
    return () => { active = false; };
  }, [locationId, user?.id, refreshCollected]);

  return (
    <div className="collect-page">
      <div className="collect-card">
        <p className="collect-eyebrow">Physical sticker scan</p>
        <h1 className="collect-title">
          {location?.name ?? 'Collecting…'}
        </h1>

        {location?.image && (
          <div className="collect-physical-preview">
            <img src={location.image} alt="" className="collect-physical-img" />
          </div>
        )}

        {status === 'loading' && (
          <div className="auth-loading collect-loading">
            <div className="auth-loading-dot" />
          </div>
        )}

        {status === 'error' && (
          <div className="auth-banner auth-banner--warning" role="alert">
            {message}
          </div>
        )}

        {status === 'done' && sticker && (
          <>
            <div className={`auth-banner ${alreadyClaimed ? 'auth-banner--warning' : 'auth-banner--success'}`} role="status">
              {message}
            </div>
            <div className="collect-reveal">
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
            <Link to="/profile" className="auth-btn auth-btn--primary">View my stickers</Link>
          ) : (
            <>
              <Link to="/register" className="auth-btn auth-btn--primary">Create account to save</Link>
              <Link to="/login" className="auth-btn auth-btn--google">Log in</Link>
            </>
          )}
          <button type="button" className="auth-btn auth-btn--google" onClick={() => navigate('/')}>
            Back to map
          </button>
        </div>
      </div>
    </div>
  );
}
