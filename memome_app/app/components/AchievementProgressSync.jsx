// component that syncs achievement stickers progress with the server

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { markAppOpened } from '../utils/achievementProgressStore';

/** Records first authenticated app open for achievement sticker 02. */
export default function AchievementProgressSync() {
  const { user } = useAuth();

  // calling markAppOpened is a side effect on the external store that shouldn't run during render
  // keying it on user?.id means it re-fires on login/logout transitions
  useEffect(() => {
    markAppOpened(user?.id ?? 'guest');
  }, [user?.id]);

  return null;
}
