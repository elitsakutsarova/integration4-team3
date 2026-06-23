// page for viewing all memos shared by user (archive)

import { useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { DiscoverFeaturedMemosList } from './FeaturedMemosSection';
import { goBack, paths } from '../../utils/appPaths';
import { discoverAssets } from '../../utils/discoverAssets';
import { scrollDiscoverToTop } from '../../utils/discoverScroll';
import BackChevron from '../BackChevron';

function scrollArchiveToTop() {
  scrollDiscoverToTop();
}

export default function MemoArchivePage({
  spotTitle,
  locationName,
  memos,
  memoCount,
}) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    scrollArchiveToTop();
    const frame = window.requestAnimationFrame(scrollArchiveToTop);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, search]);

  function handleBack() {
    goBack(navigate, paths.discover);
  }

  return (
    <div className="memo-archive-page">
      <header className="memo-archive-header">
        <div className="memo-archive-header-deco" aria-hidden="true">
          <div className="memo-archive-header-grid" />
          <img
            className="memo-archive-header-corner"
            src={discoverAssets.greenGrid}
            alt=""
          />
          <div className="memo-archive-header-doodle" />
          <img
            className="memo-archive-header-pin"
            src={discoverAssets.purple_pin}
            alt="purple pin"
          />
        </div>

        <BackChevron className="memo-archive-back" onClick={handleBack} />

        <div className="memo-archive-title-banner">
          <h1 className="memo-archive-title">Memo Archive</h1>
        </div>
      </header>

      <div className="memo-archive-intro">
        <div className="memo-archive-spot-title-wrap">
          <img
            className="memo-archive-spot-title-bg"
            src={discoverAssets.selectedText}
            alt=""
            aria-hidden="true"
          />
          <h2 className="memo-archive-spot-title">{spotTitle}</h2>
        </div>
        <p className="memo-archive-count">{memoCount} memos</p>
      </div>

      <div className="memo-archive-scroll">
        {memos.length > 0 ? (
          <section
            className="featured-memos-section discover-detail-section memo-archive-memos"
            aria-label="Archived memos"
          >
            <DiscoverFeaturedMemosList memos={memos} orientation="column" />
          </section>
        ) : (
          <p className="memo-archive-empty">
            No memos at {locationName || spotTitle} yet. Be the first to share one on the map!
          </p>
        )}
      </div>
    </div>
  );
}
