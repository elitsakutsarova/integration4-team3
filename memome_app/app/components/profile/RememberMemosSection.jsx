import { Link, useLocation } from 'react-router';
import CreatedMemoCard from './CreatedMemoCard';
import { ProfileRememberWaveSvg } from './ProfileRememberWave';
import ShareSheet from '../diary/ShareSheet';
import DiscoverShareSuccess from '../discover/DiscoverShareSuccess';
import { useMemoShare } from '../../hooks/useMemoShare';
import { addMemoPathFromLocation } from '../../utils/appPaths';
import { accountAssets } from '../../utils/accountAssets';

function RememberTitle() {
  return (
    <h2 id="profile-remember-heading" className="profile-remember-title">
      Remember the time when...
    </h2>
  );
}

function RememberEmptyState({ showAddCta }) {
  const location = useLocation();

  return (
    <div className="profile-remember-empty">
      <div className="profile-remember-empty-art" aria-hidden="true">
        <img className="profile-remember-empty-deco profile-remember-empty-deco--memo" src={accountAssets.emptyMemoState} alt="Decorative empty memo illustration" />
      </div>
      <div className="profile-remember-empty-container">
      <p className="profile-remember-empty-heading">No memos yet!</p>
      <p className="profile-remember-empty-copy">
        Currently you haven&apos;t added any memos to the map.
      </p>
      </div>
      {showAddCta && (
        <div className="profile-remember-empty-cta-wrap">
          <Link to={addMemoPathFromLocation(location)} className="profile-remember-empty-cta">
            Add one now!
          </Link>
          <img className="profile-remember-empty-arrow" src={accountAssets.emptyArrow} alt="Decorative arrow pointing to add memo" aria-hidden="true" />
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
    <section className="profile-section profile-remember" aria-labelledby="profile-remember-heading">
      <ProfileRememberWaveSvg />
      <RememberTitle />

      {memos.length > 0 ? (
        <div className="profile-remember-scroll">
          <div className="profile-remember-track">
            {memos.map((memo) => (
              <CreatedMemoCard
                key={memo.id}
                memo={memo}
                onShare={() => openShare(memo)}
                showFavoriteInsteadOfEdit
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
