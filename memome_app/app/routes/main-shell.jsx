import { Outlet, useLoaderData, useLocation } from 'react-router';
import MapView from '../components/MapView';
import DesktopNav from '../components/DesktopNav';
import AuthLoading from '../components/auth/AuthLoading';
import { bootstrapAuthSession } from '../utils/authSession';
import { fetchMemos } from '../utils/memoStore';
import { paths } from '../utils/appPaths';

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
  return Boolean(formAction);
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
