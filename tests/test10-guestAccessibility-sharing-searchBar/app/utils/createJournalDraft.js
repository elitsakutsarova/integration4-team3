const STORAGE_KEY = 'memome:create-journal-draft';

export const TITLE_MAX = 30;
export const DESCRIPTION_MAX = 200;

export const EMPTY_CREATE_JOURNAL_DRAFT = {
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

export function loadCreateJournalDraft() {
  const raw = readRaw();
  if (!raw || typeof raw !== 'object') return { ...EMPTY_CREATE_JOURNAL_DRAFT };

  return {
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    startDate: String(raw.startDate ?? ''),
    endDate: String(raw.endDate ?? ''),
    selectedMemoIds: Array.isArray(raw.selectedMemoIds)
      ? raw.selectedMemoIds.map(String)
      : [],
  };
}

export function saveCreateJournalDraft(draft) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearCreateJournalDraft() {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function isCreateJournalDraftDirty(draft) {
  return Boolean(
    draft.title.trim()
    || draft.description.trim()
    || draft.startDate
    || draft.endDate
    || draft.selectedMemoIds.length,
  );
}

export function localTodayIsoDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isFutureIsoDate(isoDate) {
  if (!isoDate) return false;
  return isoDate > localTodayIsoDate();
}

export function formatDraftDateLabel(isoDate) {
  if (!isoDate) return '';
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatCustomJournalDateRange(startDate, endDate) {
  const start = formatDraftDateLabel(startDate);
  const end = formatDraftDateLabel(endDate);
  if (!start) return '';
  if (!end || start === end) return start;
  return `${start} – ${end}`;
}

export function validateCreateJournalDraft(draft) {
  const errors = {};

  if (!draft.title.trim()) {
    errors.title = 'Required field! Please add a title';
  } else if (draft.title.trim().length > TITLE_MAX) {
    errors.title = `Title must be ${TITLE_MAX} characters or fewer`;
  }

  if (!draft.description.trim()) {
    errors.description = 'Please add a description';
  } else if (draft.description.trim().length > DESCRIPTION_MAX) {
    errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer`;
  }

  if (!draft.startDate) {
    errors.startDate = 'Required field! Please choose a start date';
  } else if (isFutureIsoDate(draft.startDate)) {
    errors.startDate = 'Please choose a date that is not in the future';
  }

  if (draft.endDate && isFutureIsoDate(draft.endDate)) {
    errors.endDate = 'Please choose a date that is not in the future';
  }

  if (
    draft.startDate
    && draft.endDate
    && !isFutureIsoDate(draft.startDate)
    && !isFutureIsoDate(draft.endDate)
    && draft.endDate < draft.startDate
  ) {
    errors.endDate = 'End date must be on or after the start date';
  }

  if (!draft.selectedMemoIds.length) {
    errors.memos = 'Choose at least one memo for your journal';
  }

  return errors;
}

export function isCreateJournalDraftComplete(draft) {
  return Object.keys(validateCreateJournalDraft(draft)).length === 0;
}
