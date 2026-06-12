import { bootstrapAuthSession } from './authSession';
import { createMemo } from './memoStore';

export async function createMemoAction(request) {
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
