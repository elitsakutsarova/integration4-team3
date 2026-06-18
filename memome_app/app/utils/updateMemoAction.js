import { bootstrapAuthSession } from './authSession';
import { updateMemo } from './memoStore';
import { stripControlChars } from './validators';

export async function updateMemoAction(formData, serverContext = null) {
  if (!serverContext) {
    await bootstrapAuthSession();
  }

  const intent = stripControlChars(formData.get('intent')).trim();
  if (intent !== 'update-memo') {
    return { error: 'Unknown action.' };
  }

  const tags = formData.getAll('tags').map(String);
  const media = formData.get('media');
  const removeMedia = stripControlChars(formData.get('removeMedia')).trim();

  const result = await updateMemo(
    {
      memoId: formData.get('memoId'),
      quote: formData.get('quote'),
      lat: formData.get('lat'),
      lng: formData.get('lng'),
      location: formData.get('location'),
      placeId: formData.get('placeId'),
      tags,
      media: media instanceof File && media.size > 0 ? media : null,
      removeMedia,
    },
    serverContext,
  );

  if (result.error) return { error: result.error };

  return { success: true, memo: result.memo, kind: 'update' };
}
