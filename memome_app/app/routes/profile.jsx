import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCollectedStickers } from '../context/CollectedStickersContext';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import { useDiscoverFaves } from '../context/DiscoverFavesContext';
import { useSavedMemos } from '../context/SavedMemosContext';
import { useUserAvatar } from '../hooks/useUserAvatar';
import { paths, diaryPath } from '../utils/appPaths';
import { settingsAssets } from '../utils/settingsAssets';
import { TRAVEL_DIARY } from '../data/mockUser';

export function meta() {
  return [
    { title: 'MemoMe — Profile' },
    { name: 'description', content: 'Your memos, collections, and travel diaries.' },
  ];
}

function GuestProfile({ collectedStickers }) {
  const featuredSticker = collectedStickers[0];

  return (
    <div className="profile-page profile-page--guest">
      <div className="profile-guest-hero">
        <div className="profile-guest-hero-deco" aria-hidden="true">
          <img className="profile-guest-hero-grid" src={settingsAssets.topGrid} alt="" />
          <img className="profile-guest-hero-mask" src={settingsAssets.maskGroup} alt="" />
        </div>

        <header className="profile-header profile-header--guest">
          <Link to={paths.login} className="profile-settings-btn" aria-label="Settings">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        </header>

        <section className="profile-identity profile-identity--guest">
          <div className="profile-avatar profile-avatar--guest">
            <img
              className="profile-avatar-image profile-avatar-image--guest"
              src={settingsAssets.avatarPlaceholder}
              alt=""
            />
          </div>
          <div className="profile-info">
            <h1 className="profile-username">@?????</h1>
          </div>
        </section>
      </div>

      <section className="profile-section">
        <h2 className="profile-section-label">Collections</h2>
        <div className="profile-collections profile-collections--guest">
          <div className="collection-card collection-card--guest-locked" aria-disabled="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Memos</span>
          </div>
          <div className="collection-card collection-card--guest-locked" aria-disabled="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>Favorites</span>
          </div>
          <Link to={paths.stickers} className="collection-card collection-card--link collection-card--guest-active">
            {featuredSticker ? (
              <img
                className="collection-card-sticker-preview"
                src={featuredSticker.src}
                alt=""
              />
            ) : (
              <img
                className="collection-card-sticker-preview"
                src={settingsAssets.greenStar}
                alt=""
              />
            )}
            <span>Stickers</span>
          </Link>
        </div>
      </section>

      <section className="profile-section profile-diaries profile-diaries--guest">
        <h2 className="profile-section-title profile-section-title--guest">Remember the time when...</h2>
        <img className="profile-guest-wave" src={settingsAssets.vector507} alt="" aria-hidden="true" />
      </section>

      <section className="guest-create-account">
        <p className="guest-create-account-copy">
          Create account or log in to add memos
        </p>
        <Link to={paths.register} className="guest-create-account-btn">
          Create Account
        </Link>
        <p className="guest-create-account-login">
          Already have an account?{' '}
          <Link to={paths.login}>Log in</Link>
        </p>
      </section>
    </div>
  );
}

export default function Profile() {
  const collectedStickers = useCollectedStickers();
  const { createdCount, ready: createdReady } = useCreatedMemos();
  const { memosCount: savedMemosCount, ready: savedReady } = useSavedMemos();
  const { favesCount: discoverFavesCount, ready: discoverReady } = useDiscoverFaves();
  const { user } = useAuth();
  const avatarUrl = useUserAvatar(user?.id);
  const hasCustomAvatar = Boolean(avatarUrl);

  if (!user) {
    return <GuestProfile collectedStickers={collectedStickers} />;
  }

  const favouritesCount = savedMemosCount + discoverFavesCount;
  const favouritesReady = savedReady && discoverReady;

  const memosLabel = createdReady ? createdCount : (user?.collections?.memos ?? '…');
  const favouritesLabel = favouritesReady ? favouritesCount : (user?.collections?.faves ?? '…');

  return (
    <div className="profile-page">
        <header className="profile-header">
          <Link to={paths.profileSettings} className="profile-settings-btn" aria-label="Settings">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        </header>

        <section className="profile-identity">
          <div
            className={`profile-avatar${hasCustomAvatar ? ' profile-avatar--photo' : ' profile-avatar--placeholder'}`}
          >
            <img
              className={`profile-avatar-image${hasCustomAvatar ? '' : ' profile-avatar-image--placeholder'}`}
              src={hasCustomAvatar ? avatarUrl : settingsAssets.avatarPlaceholder}
              alt=""
            />
          </div>
          <div className="profile-info">
            <h1 className="profile-username">{user?.username ?? '@guest'}</h1>
            <div className="profile-tags">
              {(user?.tags ?? []).map(tag => (
                <span key={tag} className="profile-tag">{tag}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="profile-section">
          <h2 className="profile-section-label">Collections</h2>
          <div className="profile-collections">
            <Link to={paths.profileMemos} className="collection-card collection-card--link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{memosLabel} Memos</span>
            </Link>
            <Link to={paths.profileFavouritesMemos} className="collection-card collection-card--link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{favouritesLabel} Favourites</span>
            </Link>
            <Link to={paths.stickers} className="collection-card collection-card--link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>{collectedStickers.length} Stickers</span>
            </Link>
            <Link to={paths.connect} className="collection-card collection-card--link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <span>Connect</span>
            </Link>
            <Link to={paths.demoStickers} className="collection-card collection-card--link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="3" height="3" />
                <rect x="18" y="14" width="3" height="3" />
                <rect x="14" y="18" width="3" height="3" />
                <rect x="18" y="18" width="3" height="3" />
              </svg>
              <span>Scan QRs</span>
            </Link>
          </div>
        </section>

        <section className="profile-section profile-diaries">
          <div className="profile-section-row">
            <h2 className="profile-section-title">Travel Diaries</h2>
            <button type="button" className="profile-grid-btn" aria-label="Grid view">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
          </div>

          <div className="diary-cards">
            <button type="button" className="diary-card diary-card--new">
              <span className="diary-card-plus">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
              <span className="diary-card-new-label">New Travel Diary</span>
            </button>

            <Link to={diaryPath(TRAVEL_DIARY.id)} className="diary-card diary-card--existing">
              <div className="diary-card-cover">
                <span className="diary-cover-placeholder">COVER</span>
                <span className="diary-card-edit" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </span>
              </div>
              <div className="diary-card-meta">
                <span className="diary-card-title">{TRAVEL_DIARY.title}</span>
                <span className="diary-card-date">{TRAVEL_DIARY.monthLabel}</span>
              </div>
            </Link>
          </div>
        </section>
      </div>
  );
}
