import { Link } from 'react-router';

export default function AuthBackButton({ to, label = 'Back' }) {
  return (
    <Link to={to} className="auth-back-btn btn-chevron" aria-label={label}>
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 26 24" fill="none">
        <path d="M25.7886 11.8838H1.78857M12.7886 22.3838L1.78857 11.8838L12.7886 0.883789" stroke="#1952FF" stroke-width="2.5" />
      </svg>
    </Link>
  );
}
