import ChangeEmailPage from '../components/settings/ChangeEmailPage';
import { requireAuthMiddleware } from '../middleware/clientAuth';

export const clientMiddleware = requireAuthMiddleware;

export function meta() {
  return [
    { title: 'MemoMe — Change e-mail' },
    { name: 'description', content: 'Update your account email address.' },
  ];
}

export default function ProfileSettingsChangeEmailRoute() {
  return <ChangeEmailPage />;
}
