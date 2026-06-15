import SendFeedbackPage from '../components/settings/SendFeedbackPage';
import { requireAuthMiddleware } from '../middleware/clientAuth';

export const clientMiddleware = requireAuthMiddleware;

export function meta() {
  return [
    { title: 'MemoMe — Send feedback' },
    { name: 'description', content: 'Send feedback to the MemoMe team.' },
  ];
}

export default function ProfileSettingsFeedbackRoute() {
  return <SendFeedbackPage />;
}
