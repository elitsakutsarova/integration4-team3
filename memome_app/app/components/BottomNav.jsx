import { Link, useLocation, useNavigate } from 'react-router';
import { addMemoPathFromLocation, guestAddMemoPath, paths } from '../utils/appPaths';
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
  const location = useLocation();
  const { pathname } = location;
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
    const returnTo = pathname === paths.home ? null : `${pathname}${location.search}`;

    if (!user) {
      navigate(guestAddMemoPath(returnTo));
      return;
    }
    navigate(addMemoPathFromLocation(location));
  }

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <NavItem id="home" label="Home" active={active} to={paths.home}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
          <path d="M20 27.9992L12 25.1992L4 28.2992V6.73255L12 3.99922L20 6.79922L28 3.69922V25.2659L20 27.9992ZM18.6667 24.7326V9.13255L13.3333 7.26589V22.8659L18.6667 24.7326ZM21.3333 24.7326L25.3333 23.3992V7.59922L21.3333 9.13255V24.7326ZM6.66667 24.3992L10.6667 22.8659V7.26589L6.66667 8.59922V24.3992Z" fill="#9CA3AF" />
        </svg>
      </NavItem>

      <NavItem id="discover" label="Discover" active={active} to={paths.discover}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
          <path d="M23.9974 13.3327C23.9974 7.45268 19.2107 2.66602 13.3307 2.66602C7.45073 2.66602 2.66406 7.45268 2.66406 13.3327C2.66406 19.2127 7.45073 23.9993 13.3307 23.9993C15.7974 23.9993 18.0507 23.1593 19.8641 21.746L26.6641 28.546L28.5441 26.666L21.7441 19.866C23.1994 17.9987 23.9921 15.7002 23.9974 13.3327ZM5.33073 13.3327C5.33073 8.91935 8.9174 5.33268 13.3307 5.33268C17.7441 5.33268 21.3307 8.91935 21.3307 13.3327C21.3307 17.746 17.7441 21.3327 13.3307 21.3327C8.9174 21.3327 5.33073 17.746 5.33073 13.3327Z" fill="#9CA3AF" />
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
          alt="Add memo menu icon"
          aria-hidden="true"
        />
      </button>

      <NavItem id="journal" label="Journals" active={active} to={paths.journals}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
          <path d="M5.33333 29.3337V2.66699H26.6667V29.3337H5.33333ZM7.99999 26.667H24V5.33366H21.3333V14.667L18 12.667L14.6667 14.667V5.33366H7.99999V26.667Z" fill="#9CA3AF" />
        </svg>
      </NavItem>

      <NavItem id="profile" label="Profile" active={active} to={paths.profile}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
          <path d="M11.7625 14.2375C10.5875 13.0625 10 11.65 10 10C10 8.35 10.5875 6.9375 11.7625 5.7625C12.9375 4.5875 14.35 4 16 4C17.65 4 19.0625 4.5875 20.2375 5.7625C21.4125 6.9375 22 8.35 22 10C22 11.65 21.4125 13.0625 20.2375 14.2375C19.0625 15.4125 17.65 16 16 16C14.35 16 12.9375 15.4125 11.7625 14.2375ZM4 28V23.8C4 22.95 4.219 22.169 4.657 21.457C5.095 20.745 5.676 20.201 6.4 19.825C7.95 19.05 9.525 18.469 11.125 18.082C12.725 17.695 14.35 17.501 16 17.5C17.65 17.499 19.275 17.693 20.875 18.082C22.475 18.471 24.05 19.052 25.6 19.825C26.325 20.2 26.9065 20.744 27.3445 21.457C27.7825 22.17 28.001 22.951 28 23.8V28H4ZM7 25H25V23.8C25 23.525 24.9315 23.275 24.7945 23.05C24.6575 22.825 24.476 22.65 24.25 22.525C22.9 21.85 21.5375 21.344 20.1625 21.007C18.7875 20.67 17.4 20.501 16 20.5C14.6 20.499 13.2125 20.668 11.8375 21.007C10.4625 21.346 9.1 21.852 7.75 22.525C7.525 22.65 7.3435 22.825 7.2055 23.05C7.0675 23.275 6.999 23.525 7 23.8V25ZM18.1195 12.1195C18.7065 11.5315 19 10.825 19 10C19 9.175 18.7065 8.469 18.1195 7.882C17.5325 7.295 16.826 7.001 16 7C15.174 6.999 14.468 7.293 13.882 7.882C13.296 8.471 13.002 9.177 13 10C12.998 10.823 13.292 11.5295 13.882 12.1195C14.472 12.7095 15.178 13.003 16 13C16.822 12.997 17.5285 12.7035 18.1195 12.1195Z" fill="#9CA3AF" />
        </svg>
      </NavItem>
    </nav>
  );
}
