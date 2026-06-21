import { Link } from 'react-router';

export default function AuthBackButton({ to, label = 'Back' }) {
  return (
    <Link to={to} className="auth-back-btn" aria-label={label}>
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 26 24" fill="none" aria-hidden="true">
        <path
          d="M25.7886 11.8838H1.78857M12.7886 22.3838L1.78857 11.8838L12.7886 0.883789"
          stroke="#1952FF"
          strokeWidth="2.5"
        />
      </svg>
    </Link>
  );
}
