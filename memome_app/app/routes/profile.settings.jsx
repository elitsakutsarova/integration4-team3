import SettingsPage from '../components/settings/SettingsPage';
import { requireAuthMiddleware } from '../middleware/clientAuth';

export const clientMiddleware = requireAuthMiddleware;

export function meta() {
  return [
    { title: 'MemoMe — Settings' },
    { name: 'description', content: 'Account preferences and app settings.' },
  ];
}

export default function ProfileSettingsRoute() {
  return <SettingsPage />;
}
