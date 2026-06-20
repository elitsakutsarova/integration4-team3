import '../styles/modules/bottom-nav.css';
import { Outlet } from 'react-router';
import BottomNav from '../components/BottomNav';

export default function AccountLayout() {
  return (
    <>
      <Outlet />
      <div className="bottom-nav-container">
        <BottomNav />
      </div>
    </>
  );
}
