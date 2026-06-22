import { Link } from 'react-router';
import { settingsAssets } from '../../utils/settingsAssets';

function BackArrowIcon() {
  return (
    <img
      src={settingsAssets.arrowBack}
      alt=""
      width={32}
      height={32}
      aria-hidden="true"
    />
  );
}

/** Figma arrow_back control for journal flows. */
export default function JournalBackButton({
  className = 'journal-back-btn',
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
