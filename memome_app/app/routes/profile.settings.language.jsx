import '../styles/modules/auth.css';
import '../styles/modules/settings.css';
import LanguagePreferencePage from '../components/settings/LanguagePreferencePage';

export function meta() {
  return [
    { title: 'MemoMe — Language' },
    { name: 'description', content: 'Choose your MemoMe app language.' },
  ];
}

export default function ProfileSettingsLanguageRoute() {
  return <LanguagePreferencePage />;
}
