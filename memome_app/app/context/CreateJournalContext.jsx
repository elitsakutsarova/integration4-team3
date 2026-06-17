import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import {
  EMPTY_CREATE_JOURNAL_DRAFT,
  clearCreateJournalDraft,
  isCreateJournalDraftDirty,
  loadCreateJournalDraft,
  saveCreateJournalDraft,
} from '../utils/createJournalDraft';
import { addCustomJournal, deleteCustomJournal, getCustomJournals, updateCustomJournal } from '../utils/customJournalStore';

const CreateJournalContext = createContext(null);
const CustomJournalsContext = createContext(null);

export function CreateJournalProvider({ children }) {
  const [draft, setDraftState] = useState(() => loadCreateJournalDraft());

  const setDraft = useCallback((updater) => {
    setDraftState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveCreateJournalDraft(next);
      return next;
    });
  }, []);

  const resetDraft = useCallback(() => {
    const next = { ...EMPTY_CREATE_JOURNAL_DRAFT };
    clearCreateJournalDraft();
    setDraftState(next);
  }, []);

  const isDirty = useMemo(() => isCreateJournalDraftDirty(draft), [draft]);

  const value = useMemo(
    () => ({ draft, setDraft, resetDraft, isDirty }),
    [draft, isDirty, resetDraft, setDraft],
  );

  return (
    <CreateJournalContext.Provider value={value}>
      {children}
    </CreateJournalContext.Provider>
  );
}

export function useCreateJournal() {
  const ctx = useContext(CreateJournalContext);
  if (!ctx) throw new Error('useCreateJournal must be used within CreateJournalProvider');
  return ctx;
}

export function CustomJournalsProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [customJournals, setCustomJournals] = useState([]);

  useEffect(() => {
    setCustomJournals(getCustomJournals(userId));
  }, [userId]);

  const saveCustomJournal = useCallback((journal) => {
    if (!userId) return null;
    addCustomJournal(userId, journal);
    setCustomJournals(getCustomJournals(userId));
    return journal;
  }, [userId]);

  const patchCustomJournal = useCallback((journalId, updates) => {
    if (!userId) return null;
    const updated = updateCustomJournal(userId, journalId, updates);
    if (!updated) return null;
    setCustomJournals(getCustomJournals(userId));
    return updated;
  }, [userId]);

  const removeCustomJournal = useCallback((journalId, memoIds = []) => {
    if (!userId) return false;
    const removed = deleteCustomJournal(userId, journalId, memoIds);
    if (removed) setCustomJournals(getCustomJournals(userId));
    return removed;
  }, [userId]);

  const value = useMemo(
    () => ({
      customJournals,
      saveCustomJournal,
      patchCustomJournal,
      removeCustomJournal,
    }),
    [customJournals, patchCustomJournal, removeCustomJournal, saveCustomJournal],
  );

  return (
    <CustomJournalsContext.Provider value={value}>
      {children}
    </CustomJournalsContext.Provider>
  );
}

export function useCustomJournals() {
  const ctx = useContext(CustomJournalsContext);
  if (!ctx) throw new Error('useCustomJournals must be used within CustomJournalsProvider');
  return ctx;
}
