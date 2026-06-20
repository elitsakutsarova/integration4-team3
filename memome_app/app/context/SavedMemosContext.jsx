// context provider for the saved memos

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import {
  addSavedMemo,
  fetchSavedMemos,
  removeSavedMemo,
} from '../utils/savedMemosStore';
import { setSavedMemosSnapshot } from '../utils/sessionCollectionsSnapshot';

const SavedMemosContext = createContext(null);

export function SavedMemosProvider({ initialSavedMemos = [], children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [savedMemos, setSavedMemos] = useState(() => {
    setSavedMemosSnapshot(initialSavedMemos);
    return initialSavedMemos;
  });
  const [savedNotice, setSavedNotice] = useState(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    setSavedMemosSnapshot(savedMemos);
  }, [savedMemos]);

  // Initial data comes from the root clientLoader (no fetch on mount).
  // Re-fetch only when userId changes after mount — handles login/logout
  // transitions that don't trigger a full page reload.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    fetchSavedMemos(userId).then(next => setSavedMemos(next));
  }, [userId]);

  const isSaved = useCallback(
    memoId => savedMemos.some(item => item.id === String(memoId)),
    [savedMemos],
  );

  const saveMemo = useCallback(async memoId => {
    setSavedNotice('memo');
    const result = await addSavedMemo(userId, memoId);
    if (result.added) {
      setSavedMemos(result.memos);
      return true;
    }
    setSavedNotice(null);
    return false;
  }, [userId]);

  const removeMemo = useCallback(async memoId => {
    const { memos: next } = await removeSavedMemo(userId, memoId);
    setSavedMemos(next);
  }, [userId]);

  const toggleMemo = useCallback(async memoId => {
    if (isSaved(memoId)) {
      await removeMemo(memoId);
      return false;
    }
    return saveMemo(memoId);
  }, [isSaved, removeMemo, saveMemo]);

  const dismissSavedNotice = useCallback(() => {
    setSavedNotice(null);
  }, []);

  const value = useMemo(
    () => ({
      savedMemos,
      memosCount: savedMemos.length,
      ready: true,
      isSaved,
      saveMemo,
      removeMemo,
      toggleMemo,
      savedNotice,
      dismissSavedNotice,
    }),
    [dismissSavedNotice, isSaved, removeMemo, saveMemo, savedMemos, savedNotice, toggleMemo],
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
