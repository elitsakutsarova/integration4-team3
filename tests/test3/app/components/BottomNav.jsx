import { Link, useLocation } from 'react-router';

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

  const active =
    pathname.startsWith('/profile') ? 'profile'
    : pathname.startsWith('/diary') ? 'profile'
    : 'home';

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <NavItem id="home" label="Home" active={active} to="/">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 9 3 15 6 21 3 21 20 15 23 9 20 3 23" />
          <line x1="9" y1="3" x2="9" y2="20" />
          <line x1="15" y1="6" x2="15" y2="23" />
        </svg>
      </NavItem>

      <NavItem id="discover" label="Discover" active={active} to="/">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </NavItem>

      <button
        type="button"
        className="nav-add-btn"
        onClick={onAddClick}
        aria-label="Add memo"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <NavItem id="alerts" label="Alerts" active={active} to="/">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </NavItem>

      <NavItem id="profile" label="Profile" active={active} to="/profile">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </NavItem>
    </nav>
  );
}
