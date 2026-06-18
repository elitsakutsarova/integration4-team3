import { Link } from 'react-router';
import CreatedMemoCard from './CreatedMemoCard';
import ShareSheet from '../diary/ShareSheet';
import DiscoverShareSuccess from '../discover/DiscoverShareSuccess';
import { useMemoShare } from '../../hooks/useMemoShare';
import { homePathWithAddMemo } from '../../utils/appPaths';
import { accountAssets } from '../../utils/accountAssets';

function RememberTitle() {
  return (
    <h2 className="profile-remember-title">
      Remember the{' '}
      <span className="profile-remember-title-highlight">time when...</span>
    </h2>
  );
}

function RememberEmptyState({ showAddCta }) {
  return (
    <div className="profile-remember-empty">
      <div className="profile-remember-empty-art" aria-hidden="true">
        <img className="profile-remember-empty-deco profile-remember-empty-deco--group4" src={accountAssets.emptyGroup4} alt="" />
        <img className="profile-remember-empty-deco profile-remember-empty-deco--group2" src={accountAssets.emptyGroup2} alt="" />
        <img className="profile-remember-empty-map" src={accountAssets.mapIllustration} alt="" />
        <img className="profile-remember-empty-deco profile-remember-empty-deco--group1" src={accountAssets.emptyGroup1} alt="" />
        <img className="profile-remember-empty-deco profile-remember-empty-deco--group3" src={accountAssets.emptyGroup3} alt="" />
        <img className="profile-remember-empty-deco profile-remember-empty-deco--star" src={accountAssets.emptyStar} alt="" />
      </div>

      <p className="profile-remember-empty-heading">No memos yet!</p>
      <p className="profile-remember-empty-copy">
        Currently you haven&apos;t added any memos to the map.
      </p>

      {showAddCta && (
        <div className="profile-remember-empty-cta-wrap">
          <Link to={homePathWithAddMemo()} className="profile-remember-empty-cta">
            Add one now!
          </Link>
          <img className="profile-remember-empty-arrow" src={accountAssets.emptyArrow} alt="" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export default function RememberMemosSection({ memos, showAddCta = true }) {
  const {
    shareMemo,
    openShare,
    closeShare,
    confirmShare,
    showSuccess,
    closeSuccess,
    sharing,
  } = useMemoShare();

  return (
    <section className="profile-section profile-remember">
      <RememberTitle />

      {memos.length > 0 ? (
        <div className="profile-remember-scroll">
          <div className="profile-remember-track">
            {memos.map((memo) => (
              <CreatedMemoCard
                key={memo.id}
                memo={memo}
                onShare={() => openShare(memo)}
                showFavorite
                showEdit={false}
              />
            ))}
          </div>
        </div>
      ) : (
        <RememberEmptyState showAddCta={showAddCta} />
      )}

      {shareMemo && (
        <ShareSheet
          title="Share memo"
          countLabel={shareMemo.location || 'My memo'}
          onClose={closeShare}
          onShareApp={confirmShare}
          onShareContact={confirmShare}
          disabled={sharing}
        />
      )}

      {showSuccess && (
        <DiscoverShareSuccess variant="memo" onClose={closeSuccess} />
      )}
    </section>
  );
}
