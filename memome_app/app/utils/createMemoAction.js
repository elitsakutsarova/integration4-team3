import { bootstrapAuthSession, getAuthSnapshot } from './authSession';
import { createMemo } from './memoStore';
import { stripControlChars } from './validators';

export async function createMemoAction(formData, serverContext = null) {
  if (!serverContext) {
    await bootstrapAuthSession();
    const user = getAuthSnapshot().user;
    if (user) {
      serverContext = { userId: user.id, userRole: user.role };
    }
  }

  const intent = stripControlChars(formData.get('intent')).trim();
  if (intent !== 'create-memo') {
    return { error: 'Unknown action.' };
  }

  const tags = formData.getAll('tags').map(String);
  const media = formData.get('media');
  const mediaUrl = stripControlChars(formData.get('mediaUrl')).trim();
  const mediaType = stripControlChars(formData.get('mediaType')).trim();
  const result = await createMemo(
    {
      quote: formData.get('quote'),
      lat: formData.get('lat'),
      lng: formData.get('lng'),
      location: formData.get('location'),
      placeId: formData.get('placeId'),
      tags,
      media: media instanceof File && media.size > 0 ? media : null,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
    },
    serverContext,
  );

  if (result.error) return { error: result.error };

  const mediaWidth = Number(formData.get('mediaWidth'));
  const mediaHeight = Number(formData.get('mediaHeight'));
  let memo = result.memo && result.memo.mediaPreview
    && Number.isFinite(mediaWidth) && mediaWidth > 0
    && Number.isFinite(mediaHeight) && mediaHeight > 0
    ? {
        ...result.memo,
        mediaPreview: {
          ...result.memo.mediaPreview,
          width: mediaWidth,
          height: mediaHeight,
        },
      }
    : result.memo;

  const sessionRole = getAuthSnapshot().user?.role;
  if (memo && !memo.authorRole && sessionRole) {
    memo = { ...memo, authorRole: sessionRole };
  }

  return { success: true, memo };
}
