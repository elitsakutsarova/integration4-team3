import { Outlet, useLoaderData, useLocation } from 'react-router';
import MapView from '../components/MapView';
import { bootstrapAuthSession } from '../utils/authSession';
import { createMemo, fetchMemos } from '../utils/memoStore';

export async function clientLoader() {
  await bootstrapAuthSession();
  const memos = await fetchMemos();
  return { memos };
}

clientLoader.hydrate = true;

export function shouldRevalidate({ formAction }) {
  return Boolean(formAction);
}

export async function clientAction({ request }) {
  await bootstrapAuthSession();

  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? '');

  if (intent !== 'create-memo') {
    return { error: 'Unknown action.' };
  }

  const tags = formData.getAll('tags').map(String);
  const media = formData.get('media');
  const result = await createMemo({
    quote: formData.get('quote'),
    lat: formData.get('lat'),
    lng: formData.get('lng'),
    location: formData.get('location'),
    placeId: formData.get('placeId'),
    tags,
    media: media instanceof File ? media : null,
  });

  if (result.error) return { error: result.error };

  return { success: true, memo: result.memo };
}

export default function MainShell() {
  const { memos } = useLoaderData();
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="main-shell">
      <MapView savedMemos={memos} active={isHome} />
      <div className={`main-shell-content${isHome ? ' main-shell-content--hidden' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
}
