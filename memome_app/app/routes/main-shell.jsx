// layout route for our application
// loads shared data (memos)
// shows UI that should exist on multiple pages (navigation + map)
// renders child routes via Outlet

import '../styles/modules/map.css';
import '../styles/modules/bottom-nav.css';
import { Outlet, useLoaderData, useLocation } from 'react-router';
import MapView from '../components/MapView';
import DesktopNav from '../components/DesktopNav';
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

  return (
    <div className="main-shell">
      <DesktopNav />
      <MapView savedMemos={memos} active={isHome} />
      <div className={`main-shell-content${isHome ? ' main-shell-content--hidden' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
}
