// context provider for the created memos

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
import { fetchCreatedMemosByUser } from '../utils/memoStore';

const CreatedMemosContext = createContext(null);

function syncCreatedCount(count) {
  patchAuthUserCollections({ memos: count });
}

export function CreatedMemosProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [createdMemos, setCreatedMemos] = useState([]);
  const [ready, setReady] = useState(false);

  const loadCreatedMemos = useCallback(async () => {
    if (!userId) {
      setCreatedMemos([]);
      setReady(true);
      return;
    }

    setReady(false);
    const next = await fetchCreatedMemosByUser(userId);
    setCreatedMemos(next);
    syncCreatedCount(next.length);
    setReady(true);
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!userId) {
        if (!cancelled) {
          setCreatedMemos([]);
          setReady(true);
        }
        return;
      }

      if (!cancelled) setReady(false);
      const next = await fetchCreatedMemosByUser(userId);
      if (cancelled) return;
      setCreatedMemos(next);
      syncCreatedCount(next.length);
      setReady(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const value = useMemo(
    () => ({
      createdMemos,
      createdCount: createdMemos.length,
      ready,
      refreshCreatedMemos: loadCreatedMemos,
    }),
    [createdMemos, loadCreatedMemos, ready],
  );

  return (
    <CreatedMemosContext.Provider value={value}>
      {children}
    </CreatedMemosContext.Provider>
  );
}

export function useCreatedMemos() {
  const ctx = useContext(CreatedMemosContext);
  if (!ctx) throw new Error('useCreatedMemos must be used within CreatedMemosProvider');
  return ctx;
}
