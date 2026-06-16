// layout for the discover page

import { Outlet } from 'react-router';
import BottomNav from '../components/BottomNav';

export default function DiscoverLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}
