import { bootstrapAuthSession } from './authSession';
import { createMemo } from './memoStore';
import { stripControlChars } from './validators';

const ALLOWED_INTENTS = new Set(['create-memo']);

export async function createMemoAction(request, serverContext = null) {
  if (!serverContext) {
    await bootstrapAuthSession();
  }

  const formData = await request.formData();
  const intent = stripControlChars(formData.get('intent')).trim();

  if (!ALLOWED_INTENTS.has(intent)) {
    return { error: 'Unknown action.' };
  }

  const tags = formData.getAll('tags').map(String);
  const media = formData.get('media');
  const result = await createMemo(
    {
      quote: formData.get('quote'),
      lat: formData.get('lat'),
      lng: formData.get('lng'),
      location: formData.get('location'),
      placeId: formData.get('placeId'),
      tags,
      media: media instanceof File ? media : null,
    },
    serverContext,
  );

  if (result.error) return { error: result.error };

  return { success: true, memo: result.memo };
}
