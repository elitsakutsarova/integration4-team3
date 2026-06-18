import '../styles/modules/stickers.css';
import '../styles/modules/map.css';
import { useState } from 'react';
import { Link, useLoaderData, useSearchParams } from 'react-router';
import AuthLoading from '../components/auth/AuthLoading';
import GuestAuthCta from '../components/GuestAuthCta';
import AchievementStickerTile from '../components/profile/AchievementStickerTile';
import StickerVisual from '../components/diary/StickerVisual';
import { useAuth } from '../context/AuthContext';
import { useCollectedStickers, useCollectedStickersLoading } from '../context/CollectedStickersContext';
import { ACHIEVEMENT_TOTAL, getAchievementStates } from '../data/achievementStickers';
import { useOwnedStickerCount } from '../hooks/useOwnedStickerCount';
import { paths } from '../utils/appPaths';
import {
  fetchCollectedStickers,
  loadDigitalStickerCatalog,
} from '../utils/collectibleStore';

export async function clientLoader() {
  const [guestCatalog, guestCollected] = await Promise.all([
    loadDigitalStickerCatalog(),
    fetchCollectedStickers(null),
  ]);
  return { guestCatalog, guestCollected };
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return <AuthLoading />;
}

export function shouldRevalidate({ formAction }) {
  return Boolean(formAction);
}

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

function StickersCountBadge({ tab, totalCount, achievementUnlocked }) {
  const label = tab === 'achievements'
    ? `${achievementUnlocked}/${ACHIEVEMENT_TOTAL}`
    : `${totalCount} sticker${totalCount === 1 ? '' : 's'}`;

  return (
    <div className="stickers-count-row">
      <p className="stickers-count-badge">{label}</p>
    </div>
  );
}

function GuestStickerCollection() {
  const { guestCatalog: catalog, guestCollected: collected } = useLoaderData();
  const [tab, setTab] = useState('collection');

  const collectedIds = new Set(collected.map(sticker => sticker.id));
  const guestAchievements = getAchievementStates(null, collected.length);

  return (
    <div className="stickers-page stickers-page--guest">
      <header className="stickers-header">
        <Link to={paths.profile} className="stickers-back-btn" aria-label="Back to profile">
          <BackIcon />
        </Link>
        <h1 className="stickers-title">Stickers</h1>
        <span className="stickers-header-spacer" aria-hidden="true" />
      </header>

      <div className="stickers-tabs" role="tablist" aria-label="Sticker views">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'collection'}
          className={`stickers-tab${tab === 'collection' ? ' stickers-tab--active' : ''}`}
          onClick={() => setTab('collection')}
        >
          Collection
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'achievements'}
          className={`stickers-tab${tab === 'achievements' ? ' stickers-tab--active' : ''}`}
          onClick={() => setTab('achievements')}
        >
          Achievements
        </button>
      </div>

      <StickersCountBadge
        tab={tab}
        totalCount={collectedIds.size}
        achievementUnlocked={0}
      />

      <div className="stickers-scroll">
        <div className="stickers-content" role="tabpanel">
          {tab === 'collection' && (
            <div className="stickers-grid stickers-grid--collection">
              {catalog.map(item => {
                const owned = collectedIds.has(item.id);
                const ownedSticker = collected.find(s => s.id === item.id) ?? item;
                return (
                  <div
                    key={item.id}
                    className={`stickers-tile stickers-tile--collection${owned ? '' : ' stickers-tile--locked'}`}
                  >
                    <StickerVisual src={ownedSticker.src} emoji={ownedSticker.emoji} label={ownedSticker.label} />
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'achievements' && (
            <div className="stickers-grid stickers-grid--achievements">
              {guestAchievements.map(item => (
                <AchievementStickerTile key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="stickers-guest-cta">
        <GuestAuthCta copy="Create account or log in to get access to other stickers" />
      </div>
    </div>
  );
}

export default function StickersGallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'achievements' ? 'achievements' : 'collection';

  const { user } = useAuth();
  const collected = useCollectedStickers();
  const loading = useCollectedStickersLoading();
  const { totalCount, achievementUnlocked, achievements } = useOwnedStickerCount();

  if (!user) {
    return <GuestStickerCollection />;
  }

  function switchTab(next) {
    setSearchParams(next === 'achievements' ? { tab: 'achievements' } : {}, { replace: true });
  }

  return (
    <div className="stickers-page">
        <header className="stickers-header">
          <Link to={paths.profile} className="stickers-back-btn" aria-label="Back to profile">
            <BackIcon />
          </Link>
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

        <StickersCountBadge
          tab={tab}
          totalCount={totalCount}
          achievementUnlocked={achievementUnlocked}
        />

        <div className="stickers-scroll">
          <div className="stickers-content" role="tabpanel">
            {tab === 'collection' && (
              <>
                {loading ? (
                  <p className="stickers-empty">Loading…</p>
                ) : collected.length === 0 ? (
                  <div className="stickers-empty-block">
                    <p className="stickers-empty">No stickers yet.</p>
                    <p className="stickers-empty-hint">
                      Scan the MemMe collect QR to add random stickers to your collection.
                    </p>
                    <Link to={paths.demoStickers} className="stickers-empty-link">
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
                  <AchievementStickerTile key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
