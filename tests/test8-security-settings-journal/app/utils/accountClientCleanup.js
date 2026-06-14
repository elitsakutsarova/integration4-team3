import { clearLocalUserBucket } from './localStorageUserBucket';
import { clearUserAvatar } from './userAvatarStore';

const USER_BUCKETS = ['memome_saved_memos', 'memome_discover_faves'];

export function clearAccountClientData(userId) {
  if (!userId || typeof window === 'undefined') return;

  clearUserAvatar(userId);
  USER_BUCKETS.forEach((storageKey) => clearLocalUserBucket(storageKey, userId));
}
