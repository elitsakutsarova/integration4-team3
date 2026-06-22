import '../styles/modules/auth.css';
import '../styles/modules/settings.css';
import SupportHelpPage from '../components/settings/SupportHelpPage';

export function meta() {
  return [
    { title: 'MemoMe — Support & Help' },
    { name: 'description', content: 'FAQs and support options for MemoMe.' },
  ];
}

export default function ProfileSettingsSupportRoute() {
  return <SupportHelpPage />;
}
