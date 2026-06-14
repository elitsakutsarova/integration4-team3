import { Link } from 'react-router';
import { paths } from '../../utils/appPaths';
import { journalAssets } from '../../utils/journalAssets';

export default function JournalsEmptyState() {
  return (
    <div className="journals-empty">
      <img
        className="journals-empty-illustration"
        src={journalAssets.emptyIllustration}
        alt=""
        aria-hidden="true"
      />
      <h2 className="journals-empty-title">No memos yet!</h2>
      <p className="journals-empty-text">
        Currently you don&apos;t have any recorded memos to create a journal.
      </p>
      <Link to={paths.home} className="journals-empty-cta">
        Add one now!
      </Link>
      <img
        className="journals-empty-arrow"
        src={journalAssets.emptyArrow}
        alt=""
        aria-hidden="true"
      />
    </div>
  );
}
