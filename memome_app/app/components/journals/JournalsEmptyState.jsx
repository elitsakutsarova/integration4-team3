import { Link } from 'react-router';
import { paths } from '../../utils/appPaths';
import { journalAssets } from '../../utils/journalAssets';

export default function JournalsEmptyState() {
  return (
    <div className="journals-empty">
      <div className="journals-empty-content-wrap">
      <img
        className="journals-empty-illustration"
        src={journalAssets.emptyIllustration}
        alt="Decorative empty journals illustration"
        aria-hidden="true"
      />
      <h2 className="journals-empty-title">No memos yet!</h2>
      <p className="journals-empty-text">
        Currently you don&apos;t have any recorded memos to create a journal.
      </p>
      </div>
      <div className="journals-empty-cta-wrap">
      <Link to={paths.home} className="journals-empty-cta">
        Add one now!
      </Link>
      <img
        className="journals-empty-arrow"
        src={journalAssets.emptyArrow}
        alt="Decorative arrow pointing to add memo"
        aria-hidden="true"
      />
    </div>
    </div>
  );
}
