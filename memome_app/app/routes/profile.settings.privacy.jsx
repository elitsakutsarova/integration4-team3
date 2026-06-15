import PrivacyPreferencePage from '../components/settings/PrivacyPreferencePage';
import { requireAuthMiddleware } from '../middleware/clientAuth';

export const clientMiddleware = requireAuthMiddleware;

export function meta() {
  return [
    { title: 'MemoMe — Privacy' },
    { name: 'description', content: 'Manage your MemoMe privacy permissions.' },
  ];
}

export default function ProfileSettingsPrivacyRoute() {
  return <PrivacyPreferencePage />;
}
