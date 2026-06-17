import { Outlet, useLoaderData, useLocation } from 'react-router';
import MapView from '../components/MapView';
import DesktopNav from '../components/DesktopNav';
import AuthLoading from '../components/auth/AuthLoading';
import { INITIAL_EVENTS } from '../data/mockUser';
import { bootstrapAuthSession } from '../utils/authSession';
import { fetchMemos } from '../utils/memoStore';
import { paths } from '../utils/appPaths';
import { resolveNavigableLocationHrefs } from '../utils/navigableLocation';

export async function clientLoader() {
  await bootstrapAuthSession();
  const [memos, eventLocationHrefsMap] = await Promise.all([
    fetchMemos(),
    resolveNavigableLocationHrefs(INITIAL_EVENTS),
  ]);
  // Plain object — Maps are not JSON-serializable in loader data.
  const eventLocationHrefs = Object.fromEntries(eventLocationHrefsMap);
  return { memos, eventLocationHrefs };
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
  const { memos, eventLocationHrefs } = useLoaderData();
  const { pathname } = useLocation();
  const isHome = pathname === paths.home;

  return (
    <div className="main-shell">
      <DesktopNav />
      <MapView savedMemos={memos} active={isHome} eventLocationHrefs={eventLocationHrefs} />
      <div className={`main-shell-content${isHome ? ' main-shell-content--hidden' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
}
