import { Link } from 'react-router';
import { paths } from '../../utils/appPaths';
import { settingsAssets } from '../../utils/settingsAssets';
import { accountAssets } from '../../utils/accountAssets';

function tagClassName(tag) {
  const slug = tag.toLowerCase().replace(/\s+/g, '-');
  return `profile-tag profile-tag--${slug}`;
}

export default function ProfileHero({
  username,
  tags = [],
  avatarUrl,
  hasCustomAvatar,
  settingsHref = paths.profileSettings,
}) {
  return (
    <section className="profile-account-hero" aria-label="Profile">
      <div className="profile-account-hero-deco" aria-hidden="true">
        <img className="profile-account-hero-mask" src={settingsAssets.maskGroup} alt="" />
        <img
          className="profile-account-hero-grid profile-account-hero-grid--blue"
          src={accountAssets.blueTopGrid}
          alt=""
        />
        <img
          className="profile-account-hero-grid profile-account-hero-grid--green"
          src={accountAssets.greenTopGrid}
          alt=""
        />
      </div>

      <header className="profile-header profile-header--account">
        <Link to={settingsHref} className="profile-settings-btn" aria-label="Settings">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
      </header>

      <div className="profile-identity profile-identity--account">
        <div
          className={`profile-avatar profile-avatar--account${hasCustomAvatar ? ' profile-avatar--photo' : ' profile-avatar--placeholder'}`}
        >
          <img
            className={`profile-avatar-image${hasCustomAvatar ? '' : ' profile-avatar-image--placeholder'}`}
            src={hasCustomAvatar ? avatarUrl : settingsAssets.avatarPlaceholder}
            alt=""
          />
        </div>
        <div className="profile-info">
          <h1 className="profile-username">{username}</h1>
          {tags.length > 0 && (
            <div className="profile-tags">
              {tags.map((tag) => (
                <span key={tag} className={tagClassName(tag)}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
