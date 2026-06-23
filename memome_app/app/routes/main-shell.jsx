// layout route for our application
// loads shared data (memos)
// shows UI that should exist on multiple pages (navigation + map)
// renders child routes via Outlet

import '../styles/modules/map.css';
import '../styles/modules/desktop-nav.css';
import '../styles/modules/bottom-nav.css';
import { Outlet, useLoaderData, useLocation } from 'react-router';
import MapView from '../components/MapView';
import DesktopNav from '../components/DesktopNav';
import MapPixelDeco from '../components/MapPixelDeco';
import AuthLoading from '../components/auth/AuthLoading';
import { bootstrapAuthSession } from '../utils/authSession';
import { fetchMemos } from '../utils/memoStore';
import { paths } from '../utils/appPaths';
import { shouldRevalidateForFormAction } from '../utils/revalidatePolicy';

export async function clientLoader() {
  await bootstrapAuthSession();
  const memos = await fetchMemos();
  return { memos };
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return (
    <div className="main-shell">
      <DesktopNav />
      <AuthLoading />
    </div>
  );
}

export function shouldRevalidate({ formAction }) {
  return shouldRevalidateForFormAction(formAction);
}

export default function MainShell() {
  const { memos } = useLoaderData();
  const { pathname } = useLocation();
  const isHome = pathname === paths.home;
  const isDiscoverRoute = pathname.startsWith('/discover');
  const isAccountRoute = pathname.startsWith('/profile') || pathname.startsWith('/stickers');

  return (
    <div className="main-shell">
      <DesktopNav />
      {isHome && (
        <div className="main-shell-pixel-deco main-shell-pixel-deco--map" aria-hidden="true">
          <MapPixelDeco />
        </div>
      )}
      <MapView savedMemos={memos} active={isHome || isDiscoverRoute} />
      <div
        className={[
          'main-shell-content',
          isHome ? 'main-shell-content--hidden' : '',
          isDiscoverRoute ? 'main-shell-content--discover-map' : '',
          isAccountRoute ? 'main-shell-content--account' : '',
        ].filter(Boolean).join(' ')}
      >
        {!isHome && (
          <div className="main-shell-pixel-deco main-shell-pixel-deco--content" aria-hidden="true">
            <MapPixelDeco />
          </div>
        )}
        <Outlet />
      </div>
    </div>
  );
}
