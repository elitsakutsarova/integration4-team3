import '../styles/modules/logged-out.css';
import LoggedOutScreen from '../components/auth/LoggedOutScreen';

export function meta() {
  return [
    { title: 'MemMe' },
    { name: 'description', content: 'See you again soon.' },
  ];
}

export default function LoggedOutRoute() {
  return <LoggedOutScreen />;
}
