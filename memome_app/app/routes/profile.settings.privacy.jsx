import PrivacyPreferencePage from '../components/settings/PrivacyPreferencePage';

export function meta() {
  return [
    { title: 'MemoMe — Privacy' },
    { name: 'description', content: 'Manage your MemoMe privacy permissions.' },
  ];
}

export default function ProfileSettingsPrivacyRoute() {
  return <PrivacyPreferencePage />;
}
