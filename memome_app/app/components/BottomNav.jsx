import { Link, useLocation, useNavigate } from 'react-router';
import { guestAddMemoPath, homePathWithAddMemo, paths } from '../utils/appPaths';
import { journalAssets } from '../utils/journalAssets';
import { useAuth } from '../context/AuthContext';

function NavItem({ id, label, active, to, onClick, children }) {
  const isActive = active === id;
  const className = `nav-item${isActive ? ' nav-item--active' : ''}`;

  if (to) {
    return (
      <Link to={to} className={className} aria-label={label} aria-current={isActive ? 'page' : undefined}>
        <span className="nav-icon">{children}</span>
        <span className="nav-label">{label}</span>
        {isActive && <span className="nav-dot" />}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
    >
      <span className="nav-icon">{children}</span>
      <span className="nav-label">{label}</span>
      {isActive && <span className="nav-dot" />}
    </button>
  );
}

export default function BottomNav({ onAddClick }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const active =
    pathname.startsWith('/profile') || pathname.startsWith('/stickers') ? 'profile'
    : pathname.startsWith('/journals') || pathname.startsWith('/diary') ? 'journal'
    : pathname.startsWith('/discover') || pathname.startsWith('/location') ? 'discover'
    : 'home';

  function handleAddClick() {
    if (onAddClick) {
      onAddClick();
      return;
    }
    if (!user) {
      navigate(guestAddMemoPath());
      return;
    }
    navigate(homePathWithAddMemo());
  }

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <NavItem id="home" label="Home" active={active} to={paths.home}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6l9-4 9 4v14a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V6z" />
          <path d="M9 3v6M15 7v6" />
        </svg>
      </NavItem>

      <NavItem id="discover" label="Discover" active={active} to={paths.discover}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </NavItem>

      <button
        type="button"
        className="nav-add-btn"
        onClick={handleAddClick}
        aria-label="Add memo"
      >
        <img
          className="nav-add-icon"
          src={journalAssets.addMenu}
          alt=""
          aria-hidden="true"
        />
      </button>

      <NavItem id="journal" label="Journals" active={active} to={paths.journals}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </NavItem>

      <NavItem id="profile" label="Profile" active={active} to={paths.profile}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </NavItem>
    </nav>
  );
}
