import { Link } from 'react-router';
import { paths } from '../../utils/appPaths';
import { accountAssets } from '../../utils/accountAssets';

function CollectionIcon({ src, alt }) {
  return <img className="profile-collection-icon" src={src} alt={alt} />;
}

export default function ProfileCollections({
  memosLabel,
  favouritesLabel,
  stickersCount,
  featuredStickerSrc,
  locked = false,
}) {
  if (locked) {
    return (
      <section className="profile-section profile-section--collections">
        <svg xmlns="http://www.w3.org/2000/svg" width="363" height="1" viewBox="0 0 363 1" fill="none">
          <path d="M0 0.5H363" stroke="#EFF1F5" />
        </svg>
        <h2 className="profile-section-label">Collections</h2>
        <div className="profile-collections profile-collections--account">
          <div className="collection-card collection-card--account collection-card--guest-locked" aria-disabled="true">
            <CollectionIcon src={accountAssets.createdMemosIcon} alt="" />
            <span>Memos</span>
          </div>
          <div className="collection-card collection-card--account collection-card--guest-locked" aria-disabled="true">
            <CollectionIcon src={accountAssets.favouritesIcon} alt="" />
            <span>Favorites</span>
          </div>
          <Link to={paths.stickers} className="collection-card collection-card--account collection-card--link collection-card--guest-active">
            {featuredStickerSrc ? (
              <img className="collection-card-sticker-preview" src={featuredStickerSrc} alt="" />
            ) : (
              <CollectionIcon src={accountAssets.stickersIcon} alt="" />
            )}
            <span>Stickers</span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-section profile-section--collections">
      <h2 className="profile-section-label">Collections</h2>
      <div className="profile-collections profile-collections--account">
        <Link to={paths.profileMemos} className="collection-card collection-card--account collection-card--link">
          <CollectionIcon src={accountAssets.createdMemosIcon} alt="" />
          <span>{memosLabel} Memos</span>
        </Link>
        <Link to={paths.profileFavouritesMemos} className="collection-card collection-card--account collection-card--link">
          <CollectionIcon src={accountAssets.favouritesIcon} alt="" />
          <span>{favouritesLabel} Favorites</span>
        </Link>
        <Link to={paths.stickers} className="collection-card collection-card--account collection-card--link">
          <CollectionIcon src={accountAssets.stickersIcon} alt="" />
          <span>{stickersCount} Stickers</span>
        </Link>
      </div>
    </section>
  );
}
