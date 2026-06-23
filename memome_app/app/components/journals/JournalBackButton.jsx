import { Link } from 'react-router';
import { settingsAssets } from '../../utils/settingsAssets';

function BackArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 26 24" fill="none">
      <path d="M25.7886 11.8838H1.78857M12.7886 22.3838L1.78857 11.8838L12.7886 0.883789" stroke="#1952FF" strokeWidth="2.5" />
    </svg>
  );
}

/** Figma arrow_back control for journal flows. */
export default function JournalBackButton({
  className = 'journal-back-btn btn-chevron',
  label = 'Back',
  onClick,
  to,
}) {
  if (to) {
    return (
      <Link to={to} className={className} aria-label={label}>
        <BackArrowIcon />
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick} aria-label={label}>
      <BackArrowIcon />
    </button>
  );
}
