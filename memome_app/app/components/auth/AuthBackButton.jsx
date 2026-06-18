import { Link } from 'react-router';

export default function AuthBackButton({ to, label = 'Back' }) {
  return (
    <Link to={to} className="auth-back-btn" aria-label={label}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 6l-6 6 6 6"
          stroke="#1952ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
