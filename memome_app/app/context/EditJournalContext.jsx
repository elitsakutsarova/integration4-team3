import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  EMPTY_EDIT_JOURNAL_DRAFT,
  clearEditJournalDraft,
  isEditJournalDraftDirty,
  loadEditJournalDraft,
  saveEditJournalDraft,
} from '../utils/editJournalDraft';

const EditJournalContext = createContext(null);

export function EditJournalProvider({ children }) {
  const [draft, setDraftState] = useState(() => loadEditJournalDraft());
  const [baseline, setBaseline] = useState(null);

  const setDraft = useCallback((updater) => {
    setDraftState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveEditJournalDraft(next);
      return next;
    });
  }, []);

  const initDraft = useCallback((nextDraft, snapshotBaseline = null) => {
    saveEditJournalDraft(nextDraft);
    setDraftState(nextDraft);
    setBaseline(snapshotBaseline ?? nextDraft);
  }, []);

  const resetDraft = useCallback(() => {
    const next = { ...EMPTY_EDIT_JOURNAL_DRAFT };
    clearEditJournalDraft();
    setDraftState(next);
    setBaseline(null);
  }, []);

  const isDirty = useMemo(
    () => isEditJournalDraftDirty(draft, baseline),
    [baseline, draft],
  );

  const value = useMemo(
    () => ({
      draft,
      baseline,
      setDraft,
      initDraft,
      resetDraft,
      isDirty,
    }),
    [baseline, draft, initDraft, isDirty, resetDraft, setDraft],
  );

  return (
    <EditJournalContext.Provider value={value}>
      {children}
    </EditJournalContext.Provider>
  );
}

export function useEditJournal() {
  const ctx = useContext(EditJournalContext);
  if (!ctx) throw new Error('useEditJournal must be used within EditJournalProvider');
  return ctx;
}
