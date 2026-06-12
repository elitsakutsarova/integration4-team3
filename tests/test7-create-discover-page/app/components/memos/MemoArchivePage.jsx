// memo archive page component for the location detail page

import { useNavigate } from 'react-router';
import BottomNav from '../BottomNav';
import MemoArchiveCard from './MemoArchiveCard';
import { goBack } from '../../utils/navigationBack';
import { paths } from '../../utils/appPaths';

export default function MemoArchivePage({
  spotTitle,
  locationName,
  memos,
  memoCount,
}) {
  const navigate = useNavigate();

  function handleBack() {
    goBack(navigate, paths.discover);
  }

  return (
    <div className="memo-archive-page">
      <div className="memo-archive-header">
        <div className="memo-archive-header-grid" aria-hidden="true" />
        <div className="memo-archive-header-wave" aria-hidden="true" />

        <button type="button" className="memo-archive-back" onClick={handleBack} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="#1952ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="memo-archive-title-banner">
          <h1 className="memo-archive-title">Memo Archive</h1>
        </div>
      </div>

      <div className="memo-archive-intro">
        <h2 className="memo-archive-spot-title">
          <span className="memo-archive-spot-highlight">{spotTitle}</span>
        </h2>
        <p className="memo-archive-count">{memoCount} memos</p>
      </div>

      <div className="memo-archive-scroll">
        {memos.length > 0 ? (
          <div className="memo-archive-list">
            {memos.map(memo => (
              <MemoArchiveCard key={memo.id} memo={memo} />
            ))}
          </div>
        ) : (
          <p className="memo-archive-empty">
            No memos at {locationName || spotTitle} yet. Be the first to share one on the map!
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
