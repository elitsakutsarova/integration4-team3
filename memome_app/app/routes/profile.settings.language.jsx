import LanguagePreferencePage from '../components/settings/LanguagePreferencePage';
import { requireAuthMiddleware } from '../middleware/clientAuth';

export const clientMiddleware = requireAuthMiddleware;

export function meta() {
  return [
    { title: 'MemoMe — Language' },
    { name: 'description', content: 'Choose your MemoMe app language.' },
  ];
}

export default function ProfileSettingsLanguageRoute() {
  return <LanguagePreferencePage />;
}
