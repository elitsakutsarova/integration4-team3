import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import BottomNav from '../components/BottomNav';
import StickerVisual from '../components/diary/StickerVisual';
import RequireAuth from '../components/auth/RequireAuth';
import { useAuth } from '../context/AuthContext';
import { useCollectedStickers, useCollectedStickersLoading } from '../context/CollectedStickersContext';
import { getAchievementStates } from '../data/achievementStickers';

export function meta() {
  return [
    { title: 'MemMe — Stickers' },
    { name: 'description', content: 'Your sticker collection and achievements.' },
  ];
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default function StickersGallery() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [tab, setTab] = useState(tabParam === 'achievements' ? 'achievements' : 'collection');

  const { user } = useAuth();
  const collected = useCollectedStickers();
  const loading = useCollectedStickersLoading();
  const achievements = getAchievementStates(user, collected.length);

  function switchTab(next) {
    setTab(next);
    setSearchParams(next === 'achievements' ? { tab: 'achievements' } : {}, { replace: true });
  }

  return (
    <RequireAuth>
      <div className="stickers-page">
        <header className="stickers-header">
          <button type="button" className="stickers-back-btn" aria-label="Back to profile" onClick={() => navigate('/profile')}>
            <BackIcon />
          </button>
          <h1 className="stickers-title">Stickers</h1>
          <span className="stickers-header-spacer" aria-hidden="true" />
        </header>

        <div className="stickers-tabs" role="tablist" aria-label="Sticker views">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'collection'}
            className={`stickers-tab${tab === 'collection' ? ' stickers-tab--active' : ''}`}
            onClick={() => switchTab('collection')}
          >
            Collection
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'achievements'}
            className={`stickers-tab${tab === 'achievements' ? ' stickers-tab--active' : ''}`}
            onClick={() => switchTab('achievements')}
          >
            Achievements
          </button>
        </div>

        <div className="stickers-content" role="tabpanel">
          {tab === 'collection' && (
            <>
              {loading ? (
                <p className="stickers-empty">Loading…</p>
              ) : collected.length === 0 ? (
                <div className="stickers-empty-block">
                  <p className="stickers-empty">No stickers yet.</p>
                  <p className="stickers-empty-hint">
                    Scan a physical MemMe sticker in Antwerp to add to your collection.
                  </p>
                  <Link to="/demo-stickers" className="stickers-empty-link">
                    Open demo sticker QRs
                  </Link>
                </div>
              ) : (
                <div className="stickers-grid stickers-grid--collection">
                  {collected.map(sticker => (
                    <div key={sticker.id} className="stickers-tile stickers-tile--collection">
                      <StickerVisual src={sticker.src} emoji={sticker.emoji} label={sticker.label} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'achievements' && (
            <div className="stickers-grid stickers-grid--achievements">
              {achievements.map(item => (
                <div
                  key={item.id}
                  className={`stickers-tile stickers-tile--achievement${item.unlocked ? '' : ' stickers-tile--locked'}`}
                >
                  <div className="stickers-tile-art">
                    <StickerVisual src={item.src} emoji={item.emoji} label={item.label} />
                  </div>
                  <span className="stickers-achievement-label">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </RequireAuth>
  );
}
