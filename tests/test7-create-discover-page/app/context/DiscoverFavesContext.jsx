// this provider manages Saved events, saved places, favorite count, save/remove functionality
// provides the "Saved!" notification

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import { patchAuthUserCollections } from '../utils/authSession';
import {
  addDiscoverFave,
  fetchDiscoverFaves,
  removeDiscoverFave,
} from '../utils/discoverFavesStore';

const DiscoverFavesContext = createContext(null);

function syncFavesCount(count) {
  patchAuthUserCollections({ faves: count });
}

export function DiscoverFavesProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [faves, setFaves] = useState([]);
  const [savedNotice, setSavedNotice] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFaves() {
      const next = await fetchDiscoverFaves(userId);
      if (cancelled) return;
      setFaves(next);
      if (userId) syncFavesCount(next.length);
    }

    void loadFaves();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isFaved = useCallback(
    (type, id) => faves.some(item => item.type === type && item.id === id),
    [faves],
  );

  const saveFave = useCallback(async (type, id) => {
    const result = await addDiscoverFave(userId, {
      type,
      id,
      savedAt: new Date().toISOString(),
    });

    if (result.added) {
      setFaves(result.faves);
      syncFavesCount(result.faves.length);
      setSavedNotice(type);
    }

    return result.added;
  }, [userId]);

  const removeFave = useCallback(async (type, id) => {
    const { faves: next } = await removeDiscoverFave(userId, type, id);
    setFaves(next);
    syncFavesCount(next.length);
  }, [userId]);

  const toggleFave = useCallback(async (type, id) => {
    if (isFaved(type, id)) {
      await removeFave(type, id);
      return false;
    }
    return saveFave(type, id);
  }, [isFaved, removeFave, saveFave]);

  const dismissSavedNotice = useCallback(() => {
    setSavedNotice(null);
  }, []);

  const value = useMemo(
    () => ({
      faves,
      favesCount: faves.length,
      isFaved,
      saveFave,
      removeFave,
      toggleFave,
      savedNotice,
      dismissSavedNotice,
    }),
    [dismissSavedNotice, faves, isFaved, removeFave, saveFave, savedNotice, toggleFave],
  );

  return (
    <DiscoverFavesContext.Provider value={value}>
      {children}
    </DiscoverFavesContext.Provider>
  );
}

export function useDiscoverFaves() {
  const ctx = useContext(DiscoverFavesContext);
  if (!ctx) throw new Error('useDiscoverFaves must be used within DiscoverFavesProvider');
  return ctx;
}
