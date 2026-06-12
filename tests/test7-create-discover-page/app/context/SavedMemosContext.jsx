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
  addSavedMemo,
  fetchSavedMemos,
  removeSavedMemo,
} from '../utils/savedMemosStore';

const SavedMemosContext = createContext(null);

function syncMemosCount(count) {
  patchAuthUserCollections({ memos: count });
}

export function SavedMemosProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [savedMemos, setSavedMemos] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);

    async function loadMemos() {
      const next = await fetchSavedMemos(userId);
      if (cancelled) return;
      setSavedMemos(next);
      if (userId) syncMemosCount(next.length);
      setReady(true);
    }

    void loadMemos();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isSaved = useCallback(
    memoId => savedMemos.some(item => item.id === String(memoId)),
    [savedMemos],
  );

  const saveMemo = useCallback(async memoId => {
    const result = await addSavedMemo(userId, memoId);
    if (result.added) {
      setSavedMemos(result.memos);
      syncMemosCount(result.memos.length);
    }
    return result.added;
  }, [userId]);

  const removeMemo = useCallback(async memoId => {
    const { memos: next } = await removeSavedMemo(userId, memoId);
    setSavedMemos(next);
    syncMemosCount(next.length);
  }, [userId]);

  const toggleMemo = useCallback(async memoId => {
    if (isSaved(memoId)) {
      await removeMemo(memoId);
      return false;
    }
    return saveMemo(memoId);
  }, [isSaved, removeMemo, saveMemo]);

  const value = useMemo(
    () => ({
      savedMemos,
      memosCount: savedMemos.length,
      ready,
      isSaved,
      saveMemo,
      removeMemo,
      toggleMemo,
    }),
    [isSaved, ready, removeMemo, saveMemo, savedMemos, toggleMemo],
  );

  return (
    <SavedMemosContext.Provider value={value}>
      {children}
    </SavedMemosContext.Provider>
  );
}

export function useSavedMemos() {
  const ctx = useContext(SavedMemosContext);
  if (!ctx) throw new Error('useSavedMemos must be used within SavedMemosProvider');
  return ctx;
}
