import { Link } from 'react-router';

function BackChevronIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="21" viewBox="0 0 26 24" fill="none" aria-hidden="true">
      <path d="M25.7886 11.8838H1.78857M12.7886 22.3838L1.78857 11.8838L12.7886 0.883789" stroke="#1952FF" strokeWidth="2.5" />
    </svg>
  );
}

/**
 * Reusable blue back-chevron control.
 * Pass `to` for route navigation; otherwise pass `onClick` for history/actions.
 */
export default function BackChevron({ className, onClick, to, label = 'Back' }) {
  const classNames = `btn-chevron ${className || ''}`.trim();

  if (to) {
    return (
      <Link to={to} className={classNames} aria-label={label}>
        <BackChevronIcon />
      </Link>
    );
  }

  return (
    <button type="button" className={classNames} onClick={onClick} aria-label={label}>
      <BackChevronIcon />
    </button>
  );
}
