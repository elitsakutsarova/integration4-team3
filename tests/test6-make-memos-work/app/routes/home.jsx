import { redirect, useLoaderData } from 'react-router';
import MapView from '../components/MapView';
import { bootstrapAuthSession } from '../utils/authSession';
import { createMemo, fetchMemos } from '../utils/memoStore';

export function meta() {
  return [
    { title: 'MemoMe — Map' },
    { name: 'description', content: 'Pin your memories on the map.' },
  ];
}

export async function clientLoader() {
  await bootstrapAuthSession();
  const memos = await fetchMemos();
  return { memos };
}

clientLoader.hydrate = true;

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
    tags,
    media: media instanceof File ? media : null,
  });

  if (result.error) return { error: result.error };

  return redirect('/');
}

export default function Home() {
  const { memos } = useLoaderData();
  return <MapView savedMemos={memos} />;
}
