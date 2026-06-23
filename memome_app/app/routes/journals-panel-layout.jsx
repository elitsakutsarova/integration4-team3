import '../styles/modules/discover.css';
import { Outlet } from 'react-router';
import DiscoverDesktopShell from '../components/discover/DiscoverDesktopShell';

export default function JournalsPanelLayout() {
  return (
    <DiscoverDesktopShell>
      <Outlet />
    </DiscoverDesktopShell>
  );
}
