import { Outlet } from 'react-router';
import BottomNav from '../components/BottomNav';
import { requireAuthMiddleware } from '../middleware/clientAuth';

export const clientMiddleware = requireAuthMiddleware;

export default function AccountLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}
