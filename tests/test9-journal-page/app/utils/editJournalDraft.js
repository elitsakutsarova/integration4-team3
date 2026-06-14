import {
  DESCRIPTION_MAX,
  TITLE_MAX,
} from './createJournalDraft';

const STORAGE_KEY = 'memome:edit-journal-draft';

export const EMPTY_EDIT_JOURNAL_DRAFT = {
  journalId: '',
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  selectedMemoIds: [],
};

function readRaw() {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');
  } catch {
    return null;
  }
}

export function loadEditJournalDraft() {
  const raw = readRaw();
  if (!raw || typeof raw !== 'object') return { ...EMPTY_EDIT_JOURNAL_DRAFT };

  return {
    journalId: String(raw.journalId ?? ''),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    startDate: String(raw.startDate ?? ''),
    endDate: String(raw.endDate ?? ''),
    selectedMemoIds: Array.isArray(raw.selectedMemoIds)
      ? raw.selectedMemoIds.map(String)
      : [],
  };
}

export function saveEditJournalDraft(draft) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearEditJournalDraft() {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function buildEditDraftFromJournal(journal) {
  const { startDate, endDate } = deriveJournalDates(journal);

  return {
    journalId: journal.id,
    title: journal.title ?? '',
    description: journal.description ?? '',
    startDate,
    endDate,
    selectedMemoIds: Array.isArray(journal.memoryIds)
      ? [...journal.memoryIds]
      : Array.isArray(journal.memoIds)
        ? [...journal.memoIds]
        : [],
  };
}

function deriveJournalDates(journal) {
  if (journal.startDate) {
    return {
      startDate: String(journal.startDate),
      endDate: String(journal.endDate || journal.startDate),
    };
  }

  const isoDates = (journal.memos ?? [])
    .map((memo) => {
      if (!memo?.createdAt) return '';
      const date = new Date(memo.createdAt);
      if (Number.isNaN(date.getTime())) return '';
      return date.toISOString().slice(0, 10);
    })
    .filter(Boolean)
    .sort();

  if (!isoDates.length) return { startDate: '', endDate: '' };
  return { startDate: isoDates[0], endDate: isoDates[isoDates.length - 1] };
}

export function buildPersistedJournalRecord(journal, draft) {
  const fallbackDates = deriveJournalDates(journal);
  const startDate = draft.startDate || journal.startDate || fallbackDates.startDate;
  const endDate = draft.endDate || journal.endDate || startDate;

  return {
    id: draft.journalId || journal.id,
    title: draft.title.trim(),
    description: draft.description.trim(),
    startDate,
    endDate,
    memoIds: [...draft.selectedMemoIds],
    createdAt: journal.createdAt ?? new Date().toISOString(),
  };
}

export function isEditJournalDraftDirty(draft, baseline) {
  if (!baseline) return false;
  return JSON.stringify(draft) !== JSON.stringify(baseline);
}

export function validateEditJournalDraft(draft) {
  const errors = {};

  if (!draft.title.trim()) {
    errors.title = 'Required field! Please add a title';
  } else if (draft.title.trim().length > TITLE_MAX) {
    errors.title = `Title must be ${TITLE_MAX} characters or fewer`;
  }

  if (draft.description.trim().length > DESCRIPTION_MAX) {
    errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer`;
  }

  return errors;
}

export function isEditJournalDraftComplete(draft) {
  return Object.keys(validateEditJournalDraft(draft)).length === 0;
}
