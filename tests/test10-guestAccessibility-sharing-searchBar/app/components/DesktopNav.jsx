import { Link, useLocation } from 'react-router';
import { paths } from '../utils/appPaths';

function DesktopNavItem({ id, label, active, to, children }) {
  const isActive = active === id;

  return (
    <Link
      to={to}
      className={`desktop-nav-item${isActive ? ' desktop-nav-item--active' : ''}`}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="desktop-nav-icon">{children}</span>
      <span className="desktop-nav-label">{label}</span>
    </Link>
  );
}

export default function DesktopNav() {
  const { pathname } = useLocation();

  const active =
    pathname.startsWith('/profile') || pathname.startsWith('/stickers') ? 'profile'
    : pathname.startsWith('/journals') || pathname.startsWith('/diary') ? 'journal'
    : pathname.startsWith('/discover') || pathname.startsWith('/location') ? 'discover'
    : 'home';

  return (
    <nav className="desktop-nav" aria-label="Main navigation">
      <div className="desktop-nav-top">
        <DesktopNavItem id="home" label="Home" active={active} to={paths.home}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6l9-4 9 4v14a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V6z" />
            <path d="M9 3v6M15 7v6" />
          </svg>
        </DesktopNavItem>

        <DesktopNavItem id="discover" label="Discover" active={active} to={paths.discover}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </DesktopNavItem>

        <DesktopNavItem id="journal" label="Journals" active={active} to={paths.journals}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </DesktopNavItem>
      </div>

      <DesktopNavItem id="profile" label="Profile" active={active} to={paths.profile}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </DesktopNavItem>
    </nav>
  );
}
