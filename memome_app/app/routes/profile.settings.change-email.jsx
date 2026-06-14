import ChangeEmailPage from '../components/settings/ChangeEmailPage';

export function meta() {
  return [
    { title: 'MemoMe — Change e-mail' },
    { name: 'description', content: 'Update your account email address.' },
  ];
}

export default function ProfileSettingsChangeEmailRoute() {
  return <ChangeEmailPage />;
}
