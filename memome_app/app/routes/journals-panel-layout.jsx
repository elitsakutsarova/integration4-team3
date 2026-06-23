import '../styles/modules/discover.css';
import '../styles/modules/stickers.css';
import { Outlet } from 'react-router';
import DiscoverDesktopShell from '../components/discover/DiscoverDesktopShell';
import StickerOutlineDefs from '../components/stickers/StickerOutlineDefs';

export default function JournalsPanelLayout() {
  return (
    <>
      <StickerOutlineDefs />
      <DiscoverDesktopShell>
        <Outlet />
      </DiscoverDesktopShell>
    </>
  );
}
