import '../styles/modules/auth.css';
import '../styles/modules/settings.css';
import SendFeedbackPage from '../components/settings/SendFeedbackPage';

export function meta() {
  return [
    { title: 'MemoMe — Send feedback' },
    { name: 'description', content: 'Send feedback to the MemoMe team.' },
  ];
}

export default function ProfileSettingsFeedbackRoute() {
  return <SendFeedbackPage />;
}
