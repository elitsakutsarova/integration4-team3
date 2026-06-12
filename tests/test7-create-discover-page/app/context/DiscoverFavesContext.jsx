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
  addLocalDiscoverFave,
  getLocalDiscoverFaves,
  isLocalDiscoverFaved,
  removeLocalDiscoverFave,
} from '../utils/localDiscoverFaves';

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
    const next = getLocalDiscoverFaves(userId);
    setFaves(next);
    if (userId) syncFavesCount(next.length);
  }, [userId]);

  const isFaved = useCallback(
    (type, id) => faves.some(item => item.type === type && item.id === id),
    [faves],
  );

  const saveFave = useCallback((type, id) => {
    const result = addLocalDiscoverFave(userId, {
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

  const removeFave = useCallback((type, id) => {
    const next = removeLocalDiscoverFave(userId, type, id);
    setFaves(next);
    syncFavesCount(next.length);
  }, [userId]);

  const toggleFave = useCallback((type, id) => {
    if (isLocalDiscoverFaved(userId, type, id)) {
      removeFave(type, id);
      return false;
    }
    return saveFave(type, id);
  }, [removeFave, saveFave, userId]);

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
