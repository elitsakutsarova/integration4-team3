import '../styles/modules/auth.css';
import '../styles/modules/settings.css';
import ChangePasswordPage from '../components/settings/ChangePasswordPage';

export function meta() {
  return [
    { title: 'MemoMe — Change password' },
    { name: 'description', content: 'Update your account password.' },
  ];
}

export default function ProfileSettingsChangePasswordRoute() {
  return <ChangePasswordPage />;
}
