// layout for the discover page

import '../styles/modules/discover.css';
import '../styles/modules/diary.css';
import '../styles/modules/profile-collections.css';
import { Outlet } from 'react-router';
import BottomNav from '../components/BottomNav';
import DiscoverDesktopShell from '../components/discover/DiscoverDesktopShell';

export default function DiscoverLayout() {
  return (
    <>
      <DiscoverDesktopShell>
        <Outlet />
      </DiscoverDesktopShell>
      <div className="bottom-nav-container">
        <BottomNav />
      </div>
    </>
  );
}
