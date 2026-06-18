import { data, redirect } from 'react-router';
import { useLoaderData } from 'react-router';
import EditMemoPage from '../components/EditMemoPage';
import FavouritesLoading from '../components/profile/FavouritesLoading';
import { getAuthSnapshot } from '../utils/authSession';
import { paths } from '../utils/appPaths';
import { fetchCreatedMemoById } from '../utils/memoStore';

export function meta() {
  return [
    { title: 'MemoMe — Edit Memo' },
    { name: 'description', content: 'Edit a memo you published on the map.' },
  ];
}

export async function clientLoader({ params }) {
  const { user } = getAuthSnapshot();
  if (!user?.id) {
    throw redirect(paths.login);
  }

  const memo = await fetchCreatedMemoById(user.id, params.id);
  if (!memo) {
    throw data('Memo not found', { status: 404 });
  }

  return { memo };
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return <FavouritesLoading />;
}

export function shouldRevalidate() {
  return false;
}

export default function ProfileMemoEditRoute() {
  const { memo } = useLoaderData();
  return <EditMemoPage memo={memo} />;
}
