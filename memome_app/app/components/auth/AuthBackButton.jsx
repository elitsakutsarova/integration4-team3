import { Link } from 'react-router';

export default function AuthBackButton({ to, label = 'Back' }) {
  return (
    <Link to={to} className="auth-back-btn btn-chevron" aria-label={label}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1952FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </Link>
  );
}
