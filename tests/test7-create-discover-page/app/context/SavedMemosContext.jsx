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
  addLocalSavedMemo,
  getLocalSavedMemos,
  isLocalSavedMemo,
  removeLocalSavedMemo,
} from '../utils/localSavedMemos';

const SavedMemosContext = createContext(null);

function syncMemosCount(count) {
  patchAuthUserCollections({ memos: count });
}

export function SavedMemosProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [savedMemos, setSavedMemos] = useState([]);

  useEffect(() => {
    const next = getLocalSavedMemos(userId);
    setSavedMemos(next);
    if (userId) syncMemosCount(next.length);
  }, [userId]);

  const isSaved = useCallback(
    memoId => savedMemos.some(item => item.id === String(memoId)),
    [savedMemos],
  );

  const saveMemo = useCallback(memoId => {
    const result = addLocalSavedMemo(userId, memoId);
    if (result.added) {
      setSavedMemos(result.memos);
      syncMemosCount(result.memos.length);
    }
    return result.added;
  }, [userId]);

  const removeMemo = useCallback(memoId => {
    const next = removeLocalSavedMemo(userId, memoId);
    setSavedMemos(next);
    syncMemosCount(next.length);
  }, [userId]);

  const toggleMemo = useCallback(memoId => {
    if (isLocalSavedMemo(userId, memoId)) {
      removeMemo(memoId);
      return false;
    }
    return saveMemo(memoId);
  }, [removeMemo, saveMemo, userId]);

  const value = useMemo(
    () => ({
      savedMemos,
      memosCount: savedMemos.length,
      isSaved,
      saveMemo,
      removeMemo,
      toggleMemo,
    }),
    [isSaved, removeMemo, saveMemo, savedMemos, toggleMemo],
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
