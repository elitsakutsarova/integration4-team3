const LAST_NEW_JOURNAL_KEY = 'memome_last_new_journal_id';

export function writeLastNewJournalId(journalId) {
  if (typeof sessionStorage === 'undefined' || !journalId) return;
  sessionStorage.setItem(LAST_NEW_JOURNAL_KEY, journalId);
}

export function readLastNewJournalId() {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(LAST_NEW_JOURNAL_KEY);
}
