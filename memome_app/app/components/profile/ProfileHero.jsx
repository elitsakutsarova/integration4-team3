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
       <Link to={settingsHref} className="profile-settings-btn" aria-label="Settings">
          <svg xmlns="http://www.w3.org/2000/svg" width="47" height="47" viewBox="0 0 47 47" fill="none">
            <path d="M28.0023 4.9165L28.6761 10.3071L28.7504 10.9019L29.3099 11.1167C29.6803 11.2592 30.0267 11.429 30.35 11.6255C30.7017 11.8392 31.0452 12.0684 31.3802 12.313L31.8363 12.646L32.3568 12.4272L37.3705 10.3198L41.8724 18.0952L37.5345 21.3804L37.0648 21.7358L37.1488 22.3198C37.1753 22.5052 37.1879 22.6788 37.1879 22.8403V24.1597C37.1879 24.2695 37.171 24.398 37.1283 24.5474L36.9398 25.2056L37.4857 25.6187L41.8236 28.9038L37.3236 36.6772L32.3597 34.5737L31.8392 34.353L31.3812 34.686C31.0502 34.9268 30.7032 35.153 30.3402 35.3647C29.9845 35.5722 29.6323 35.7481 29.2845 35.8931L28.7484 36.1167L28.6761 36.6929L28.0023 42.0835H18.9974L18.3236 36.6929L18.2494 36.0981L17.6898 35.8833L17.4174 35.771C17.1492 35.6541 16.8947 35.5224 16.6537 35.3755C16.3019 35.161 15.9557 34.9308 15.6166 34.6851L15.1615 34.355L14.6429 34.5728L9.6283 36.6792L5.12634 28.9038L9.46521 25.6187L9.93494 25.2632L9.85095 24.6802C9.82442 24.4944 9.81287 24.3217 9.81287 24.1616V22.8403C9.81287 22.6788 9.8245 22.5052 9.85095 22.3198L9.93494 21.7358L9.46521 21.3804L5.12634 18.0952L9.6283 10.3198L14.6429 12.4272L15.1625 12.645L15.6185 12.314C15.9498 12.073 16.2973 11.8462 16.6605 11.6343C17.0163 11.4268 17.3684 11.2509 17.7162 11.106L18.2513 10.8833L18.3236 10.3071L18.9974 4.9165H28.0023ZM23.598 15.646C21.4121 15.646 19.5293 16.4165 18.014 17.9497C16.5051 19.4765 15.7421 21.3459 15.7435 23.5005C15.745 25.6543 16.5088 27.5227 18.016 29.0493C19.5301 30.5828 21.4121 31.354 23.598 31.354C25.756 31.354 27.626 30.5798 29.1517 29.0542C30.6775 27.5284 31.4525 25.6577 31.4525 23.4995C31.4524 21.3415 30.6775 19.4715 29.1517 17.9458C27.626 16.4201 25.7561 15.646 23.598 15.646Z" stroke="#9CA3AF" stroke-width="2" />
          </svg>
        </Link>
      <header className="profile-header profile-header--account">
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
      </header>
      <div className="profile-account-hero-deco" aria-hidden="true">
        <img className="discover-list-grid" src={accountAssets.greenGrid} alt="" />
        <div className="discover-list-grid-pattern" />
      </div>
    </section>
  );
}
