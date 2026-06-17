/** Share a page URL via the native share sheet or clipboard fallback. */

import * as authStore from './authStore';
import { markContentShared } from './achievementProgressStore';

async function recordShareAchievement() {
  const session = await authStore.getSession();
  if (session?.id) markContentShared(session.id);
}

export async function sharePageLink({ title, text, url } = {}) {
  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
  if (!shareUrl) return { shared: false };

  const payload = { title, text, url: shareUrl };

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share(payload);
      await recordShareAchievement();
      return { shared: true, method: 'native' };
    } catch (err) {
      if (err?.name === 'AbortError') return { shared: false, cancelled: true };
      throw err;
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(shareUrl);
    await recordShareAchievement();
    return { shared: true, method: 'clipboard' };
  }

  return { shared: false };
}
