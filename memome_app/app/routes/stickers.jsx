import '../styles/modules/stickers.css';
import '../styles/modules/profile.css';
import '../styles/modules/map.css';
import { useMemo, useState } from 'react';
import { Link, useLoaderData, useSearchParams } from 'react-router';
import AuthLoading from '../components/auth/AuthLoading';
import GuestAuthCta from '../components/GuestAuthCta';
import AchievementStickerTile from '../components/profile/AchievementStickerTile';
import CollectionStickerTile from '../components/stickers/CollectionStickerTile';
import ProfileRememberWave from '../components/profile/ProfileRememberWave';
import StickerOutlineDefs from '../components/stickers/StickerOutlineDefs';
import { useAuth } from '../context/AuthContext';
import { useCollectedStickers, useCollectedStickersLoading } from '../context/CollectedStickersContext';
import { ACHIEVEMENT_TOTAL, getAchievementStates } from '../data/achievementStickers';
import { withDefaultJournalStickers } from '../data/defaultJournalStickers';
import { useOwnedStickerCount } from '../hooks/useOwnedStickerCount';
import { assignUniqueCollectionRotations } from '../utils/collectionStickerRotation';
import { getNewestCollectedStickerId } from '../utils/collectionNewSticker';
import { paths } from '../utils/appPaths';
import { accountAssets } from '../utils/accountAssets';
import { discoverAssets } from '../utils/discoverAssets';
import {
  fetchCollectedStickers,
  loadDigitalStickerCatalog,
} from '../utils/collectibleStore';

export async function clientLoader() {
  const { getAuthSnapshot } = await import('../utils/authSession');
  if (getAuthSnapshot().user?.id) {
    return { guestCatalog: [], guestCollected: [] };
  }

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

function StickersCountBadge({ tab, collectionCount, achievementUnlocked }) {
  const label = tab === 'achievements'
    ? `${achievementUnlocked}/${ACHIEVEMENT_TOTAL} stickers`
    : `${collectionCount} sticker${collectionCount === 1 ? '' : 's'}`;

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
  const guestAchievements = useMemo(
    () => getAchievementStates(null, collected.length),
    [collected.length],
  );
  const catalogWithRotation = useMemo(
    () => assignUniqueCollectionRotations(catalog),
    [catalog],
  );
  const newestStickerId = useMemo(
    () => getNewestCollectedStickerId(collected),
    [collected],
  );

  return (
    <div className="stickers-page stickers-page--guest">
      <StickerOutlineDefs />
      <header className="stickers-header">
        <div className="sticker-header-deco" aria-hidden="true">
          <img className="stickers-header-deco-grid" src={accountAssets.greenGrid} alt="" />
          <div className="stickers-header-deco-grid-pattern" />
          <img className="stickers-header-deco-art" src={accountAssets.stickerDeco} alt="" />
        </div>
        <div className="stickers-header-title-row">
          <div className="stickers-header-titles">
            <Link to={paths.profile} className="stickers-back-btn btn-chevron" aria-label="Back to profile">
              <BackIcon />
            </Link>
            <h1 className="stickers-title">Stickers</h1>
          </div>
          {/*  <span className="stickers-header-spacer" aria-hidden="true" /> */}
          <div className="stickers-header-title-icon">
            <img src={accountAssets.blueSticker} alt="" />
          </div>
        </div>
      </header>
      <div className="stickers-tabs" role="tablist" aria-label="Sticker views">
        <div
          className={`stickers-tab-wrapper${tab === 'collection' ? ' stickers-tab-wrapper--active' : ''
            }`}
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'collection'}
            className="stickers-tab"
            onClick={() => setTab('collection')}
          >
            Collection
          </button>
        </div>

        <div
          className={`stickers-tab-wrapper${tab === 'achievements' ? ' stickers-tab-wrapper--active' : ''
            }`}
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'achievements'}
            className="stickers-tab"
            onClick={() => setTab('achievements')}
          >
            Achievements
          </button>
        </div>
      </div>

      <ProfileRememberWave />

      <div className="stickers-scroll">
        <div className="stickers-content" role="tabpanel">
          {tab === 'collection' && (
            <div className="stickers-grid stickers-grid--collection">
              {catalogWithRotation.map(item => {
                const owned = collectedIds.has(item.id);
                return (
                  <CollectionStickerTile
                    key={item.id}
                    sticker={item}
                    locked={!owned}
                    guestLockedStyle={!owned}
                    isNew={owned && item.id === newestStickerId}
                  />
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
  const { collectedCount, achievementUnlocked, achievements } = useOwnedStickerCount();
  const collectionStickers = useMemo(
    () => assignUniqueCollectionRotations(withDefaultJournalStickers(collected, user)),
    [collected, user],
  );
  const newestStickerId = useMemo(
    () => getNewestCollectedStickerId(collected),
    [collected],
  );

  if (!user) {
    return <GuestStickerCollection />;
  }

  function switchTab(next) {
    setSearchParams(next === 'achievements' ? { tab: 'achievements' } : {}, { replace: true });
  }

  return (
    <div className="stickers-page">
      <StickerOutlineDefs />
      <header className="stickers-header">
        <div className="sticker-header-deco" aria-hidden="true">
          <img className="stickers-header-deco-grid" src={accountAssets.greenGrid} alt="" />
          <div className="stickers-header-deco-grid-pattern" />
          <img className="stickers-header-deco-art" src={accountAssets.stickerDeco} alt="" />
        </div>
        <div className="stickers-header-title-row">
          <div className="stickers-header-titles">
            <Link to={paths.profile} className="stickers-back-btn btn-chevron" aria-label="Back to profile">
              <BackIcon />
            </Link>
            <h1 className="stickers-title">Stickers</h1>
          </div>
          {/*  <span className="stickers-header-spacer" aria-hidden="true" /> */}
          <div className="stickers-header-title-icon">
            <img src={accountAssets.blueSticker} alt="" />
          </div>
        </div>
      </header>

      <div className="stickers-tabs" role="tablist" aria-label="Sticker views">
        <div
          className={`stickers-tab-wrapper${tab === 'collection' ? ' stickers-tab-wrapper--active' : ''
            }`}
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'collection'}
            className="stickers-tab"
            onClick={() => switchTab('collection')}
          >
            Collection
          </button>
        </div>

        <div
          className={`stickers-tab-wrapper${tab === 'achievements' ? ' stickers-tab-wrapper--active' : ''
            }`}
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'achievements'}
            className="stickers-tab"
            onClick={() => switchTab('achievements')}
          >
            Achievements
          </button>
        </div>
      </div>

      <ProfileRememberWave />

      <StickersCountBadge
        tab={tab}
        collectionCount={collectedCount}
        achievementUnlocked={achievementUnlocked}
      />

      <div className="stickers-scroll">
        <div className="stickers-content" role="tabpanel">
          {tab === 'collection' && (
            <>
              {loading ? (
                <p className="stickers-empty">Loading…</p>
              ) : (
                <div className="stickers-grid stickers-grid--collection">
                  {collectionStickers.map(sticker => (
                    <CollectionStickerTile
                      key={sticker.id}
                      sticker={sticker}
                      isNew={sticker.id === newestStickerId}
                    />
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
