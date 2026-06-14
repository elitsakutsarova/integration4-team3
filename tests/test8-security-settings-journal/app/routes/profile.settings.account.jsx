import AccountDetailsPage from '../components/settings/AccountDetailsPage';

export function meta() {
  return [
    { title: 'MemoMe — Account Details' },
    { name: 'description', content: 'View and manage your account details.' },
  ];
}

export default function ProfileSettingsAccountRoute() {
  return <AccountDetailsPage />;
}
