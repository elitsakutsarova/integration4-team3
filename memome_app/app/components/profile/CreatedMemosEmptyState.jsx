import { Link, useLocation } from 'react-router';
import { addMemoPathFromLocation } from '../../utils/appPaths';
import { createdMemosAssets } from '../../utils/createdMemosAssets';

export default function CreatedMemosEmptyState() {
  const location = useLocation();

  return (
    <div className="created-memos-empty">
      <img
        className="created-memos-empty-illustration"
        src={createdMemosAssets.emptyIllustration}
        alt=""
        aria-hidden="true"
      />
      <h2 className="created-memos-empty-title">No memos yet!</h2>
      <p className="created-memos-empty-text">
        Currently you haven&apos;t added any memos to the map.
      </p>
      <div className="created-memos-empty-cta-wrap">
      <Link to={addMemoPathFromLocation(location)} className="created-memos-empty-cta">
        Add one now!
      </Link>
      <img
        className="created-memos-empty-arrow"
        src={createdMemosAssets.emptyArrow}
        alt=""
        aria-hidden="true"
      />
      </div>
    </div>
  );
}
