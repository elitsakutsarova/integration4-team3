import '../styles/modules/discover.css';
import '../styles/modules/diary.css';
// layout for the discover page

import '../styles/modules/discover.css';
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
