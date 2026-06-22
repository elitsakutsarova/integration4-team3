import { NavLink, useLocation } from 'react-router';
import { paths } from '../utils/appPaths';
import {
  isDiscoverNavActive,
  isHomeNavActive,
  isJournalNavActive,
  isProfileNavActive,
} from '../utils/mainNavActive';

function DesktopNavItem({ label, to, matchActive, children }) {
  const location = useLocation();
  const active = matchActive(null, location);

  return (
    <NavLink
      to={to}
      className={() => `desktop-nav-item${active ? ' desktop-nav-item--active' : ''}`}
      aria-label={label}
    >
      <span className="desktop-nav-icon">{children}</span>
      <span className="desktop-nav-label">{label}</span>
    </NavLink>
  );
}

export default function DesktopNav() {
  return (
    <nav className="desktop-nav" aria-label="Main navigation">
      <div className="desktop-nav-top">
        <DesktopNavItem label="Home" to={paths.home} matchActive={isHomeNavActive}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6l9-4 9 4v14a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V6z" />
            <path d="M9 3v6M15 7v6" />
          </svg>
        </DesktopNavItem>

        <DesktopNavItem label="Discover" to={paths.discover} matchActive={isDiscoverNavActive}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </DesktopNavItem>

        <DesktopNavItem label="Journals" to={paths.journals} matchActive={isJournalNavActive}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </DesktopNavItem>
      </div>

      <DesktopNavItem label="Profile" to={paths.profile} matchActive={isProfileNavActive}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </DesktopNavItem>
    </nav>
  );
}
