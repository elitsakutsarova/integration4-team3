// component that syncs achievement stickers progress with the server

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { markAppOpened } from '../utils/achievementProgressStore';

/** Records first authenticated app open for achievement sticker 02. */
export default function AchievementProgressSync() {
  const { user } = useAuth();

  // Records first authenticated app open — side effect must not run during render.
  useEffect(() => {
    markAppOpened(user?.id ?? 'guest');
  }, [user?.id]);

  return null;
}
