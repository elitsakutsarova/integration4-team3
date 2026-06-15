import ChangePasswordPage from '../components/settings/ChangePasswordPage';
import { requireAuthMiddleware } from '../middleware/clientAuth';

export const clientMiddleware = requireAuthMiddleware;

export function meta() {
  return [
    { title: 'MemoMe — Change password' },
    { name: 'description', content: 'Update your account password.' },
  ];
}

export default function ProfileSettingsChangePasswordRoute() {
  return <ChangePasswordPage />;
}
