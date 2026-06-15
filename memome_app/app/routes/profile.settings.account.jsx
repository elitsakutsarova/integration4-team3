import AccountDetailsPage from '../components/settings/AccountDetailsPage';
import { requireAuthMiddleware } from '../middleware/clientAuth';

export const clientMiddleware = requireAuthMiddleware;

export function meta() {
  return [
    { title: 'MemoMe — Account Details' },
    { name: 'description', content: 'View and manage your account details.' },
  ];
}

export default function ProfileSettingsAccountRoute() {
  return <AccountDetailsPage />;
}
