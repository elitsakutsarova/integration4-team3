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
  settingsDisabled = false,
}) {
  const settingsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="31" height="31" viewBox="0 0 31 31" fill="none">
      <path d="M18.8506 1L19.3574 5.05762L19.4316 5.65137L19.9912 5.86621C20.2712 5.97391 20.5322 6.10225 20.7754 6.25C21.0472 6.41513 21.3133 6.5922 21.5723 6.78125L22.0283 7.11426L22.5488 6.89551L26.3232 5.30957L29.6787 11.1055L26.4141 13.5791L25.9443 13.9346L26.0273 14.5176C26.0469 14.6545 26.0566 14.781 26.0566 14.8975V15.9365C26.0566 16.001 26.0463 16.082 26.0176 16.1826L25.8291 16.8408L26.375 17.2549L29.6406 19.7266L26.2861 25.5205L22.5518 23.9385L22.0312 23.7178L21.5732 24.0508C21.3185 24.236 21.0512 24.41 20.7715 24.5732C20.4991 24.7321 20.2303 24.8663 19.9658 24.9766L19.4297 25.2002L19.3574 25.7764L18.8506 29.833H12.1367L11.6299 25.7764L11.5557 25.1816L10.9961 24.9668L10.79 24.8818C10.5877 24.7936 10.396 24.6944 10.2148 24.584C9.94291 24.4182 9.67551 24.24 9.41309 24.0498L8.95703 23.7197L8.43848 23.9375L4.66406 25.5225L1.30762 19.7266L4.57324 17.2549L5.04297 16.8994L4.95996 16.3154C4.9404 16.1784 4.93164 16.0525 4.93164 15.9375V14.8975C4.93164 14.781 4.94041 14.6545 4.95996 14.5176L5.04297 13.9346L4.57324 13.5791L1.30762 11.1055L4.66406 5.30957L8.43848 6.89551L8.95801 7.11426L9.41406 6.78223C9.66893 6.59687 9.9369 6.42304 10.2168 6.25977C10.4893 6.10085 10.7579 5.96667 11.0225 5.85645L11.5576 5.63281L11.6299 5.05762L12.1367 1H18.8506ZM15.5713 9.02051C13.7951 9.02051 12.2573 9.64992 11.0234 10.8984C9.7962 12.1404 9.17368 13.6655 9.1748 15.417C9.17601 17.1681 9.79929 18.6927 11.0254 19.9346C12.2584 21.1834 13.7951 21.8125 15.5713 21.8125C17.3265 21.8124 18.8528 21.1804 20.0938 19.9395C21.3347 18.6985 21.9667 17.1722 21.9668 15.417C21.9668 13.6616 21.3348 12.1346 20.0938 10.8936C18.8528 9.65265 17.3265 9.02062 15.5713 9.02051Z"  strokeWidth="2" />
    </svg>
  );

  return (
    <section className="profile-account-hero" aria-label="Profile">
      {settingsDisabled ? (
        <span
          className="profile-settings-btn profile-settings-btn--disabled"
          aria-label="Settings unavailable for guest accounts"
          aria-disabled="true"
        >
          {settingsIcon}
        </span>
      ) : (
        <Link to={settingsHref} className="profile-settings-btn" aria-label="Settings">
          {settingsIcon}
        </Link>
      )}
      <header className="profile-header profile-header--account">
          <div className="profile-identity profile-identity--account">
            <div
            className={`profile-avatar profile-avatar--account${hasCustomAvatar ? ' profile-avatar--photo' : ' profile-avatar--placeholder'}`}
            >
              <img
                className={`profile-avatar-image${hasCustomAvatar ? '' : ' profile-avatar-image--placeholder'}`}
                src={
                  hasCustomAvatar
                    ? avatarUrl
                    : settingsDisabled
                      ? accountAssets.guestProfilePic
                      : settingsAssets.avatarPlaceholder
                }
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
      </header>
      <div className="profile-account-hero-deco" aria-hidden="true">
        <img className="discover-list-grid" src={accountAssets.greenGrid} alt="" />
        <div className="discover-list-grid-pattern" />
      </div>
    </section>
  );
}
