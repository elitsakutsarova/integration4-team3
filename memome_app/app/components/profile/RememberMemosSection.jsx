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
      Remember the time when...
    </h2>
  );
}

function RememberEmptyState({ showAddCta }) {
  return (
    <div className="profile-remember-empty">
      <div className="profile-remember-empty-art" aria-hidden="true">
        <img className="profile-remember-empty-deco profile-remember-empty-deco--memo" src={accountAssets.emptyMemoState} alt="" />
      </div>
      <div className="profile-remember-empty-container">
      <p className="profile-remember-empty-heading">No memos yet!</p>
      <p className="profile-remember-empty-copy">
        Currently you haven&apos;t added any memos to the map.
      </p>
      </div>
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 393 55" fill="none">
        <path d="M-128.834 113.142C-56.0212 113.784 -22.3531 73.6311 -45.5313 64.1334C-73.3447 52.7364 -11.7611 39.4134 12.5795 24.8733C46.2416 4.76494 127.712 6.32484 178.627 15.493C317.507 40.5007 390.2 -17.6409 482.2 7.85375" stroke="#1952FF" strokeWidth="2.47" strokeDasharray="8 8" />
      </svg>
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
