import { useCallback, useSyncExternalStore } from 'react';
import { getUserAvatar, subscribeUserAvatar } from '../utils/userAvatarStore';

export function useUserAvatar(userId) {
  const getSnapshot = useCallback(() => getUserAvatar(userId), [userId]);

  return useSyncExternalStore(subscribeUserAvatar, getSnapshot, () => null);
}
