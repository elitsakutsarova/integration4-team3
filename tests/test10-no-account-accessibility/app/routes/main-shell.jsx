import { Outlet, useLoaderData, useLocation } from 'react-router';
import MapView from '../components/MapView';
import DesktopNav from '../components/DesktopNav';
import { bootstrapAuthSession } from '../utils/authSession';
import { fetchMemos } from '../utils/memoStore';

export async function clientLoader() {
  await bootstrapAuthSession();
  const memos = await fetchMemos();
  return { memos };
}

clientLoader.hydrate = true;

export function shouldRevalidate({ formAction }) {
  return Boolean(formAction);
}

export default function MainShell() {
  const { memos } = useLoaderData();
  const { pathname } = useLocation();
  const isHome = pathname === '/';

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
