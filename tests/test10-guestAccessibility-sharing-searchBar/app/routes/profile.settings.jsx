import SettingsPage from '../components/settings/SettingsPage';

export function meta() {
  return [
    { title: 'MemoMe — Settings' },
    { name: 'description', content: 'Account preferences and app settings.' },
  ];
}

export default function ProfileSettingsRoute() {
  return <SettingsPage />;
}
