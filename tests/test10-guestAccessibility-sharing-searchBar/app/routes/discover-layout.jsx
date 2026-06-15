// layout for the discover page

import { Outlet } from 'react-router';
import BottomNav from '../components/BottomNav';
import DiscoverSavedModal from '../components/discover/DiscoverSavedModal';

export default function DiscoverLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
      <DiscoverSavedModal />
    </>
  );
}
