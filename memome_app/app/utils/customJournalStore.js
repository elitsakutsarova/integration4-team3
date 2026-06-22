const STORAGE_KEY = 'memome:custom-journals';

function readAll() {
  if (typeof localStorage === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeAll(data) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getCustomJournals(userId) {
  if (!userId) return [];
  const all = readAll();
  const rows = all[userId];
  return Array.isArray(rows) ? rows : [];
}

export function addCustomJournal(userId, journal) {
  if (!userId || !journal?.id) return;

  const all = readAll();
  const existing = Array.isArray(all[userId]) ? all[userId] : [];
  const duplicateIndex = existing.findIndex((row) => row.id === journal.id);

  if (duplicateIndex >= 0) {
    existing[duplicateIndex] = { ...existing[duplicateIndex], ...journal };
    all[userId] = existing;
  } else {
    all[userId] = [journal, ...existing];
  }

  writeAll(all);
}

export function updateCustomJournal(userId, journalId, updates) {
  if (!userId || !journalId) return null;

  const all = readAll();
  const rows = Array.isArray(all[userId]) ? all[userId] : [];
  let updated = null;

  all[userId] = rows.map((journal) => {
    if (journal.id !== journalId) return journal;
    updated = { ...journal, ...updates, id: journalId };
    return updated;
  });

  writeAll(all);
  return updated;
}

export function deleteCustomJournal(userId, journalId, memoIds = []) {
  if (!userId || !journalId) return false;

  const all = readAll();
  const rows = Array.isArray(all[userId]) ? all[userId] : [];
  const tombstone = {
    id: journalId,
    deleted: true,
    memoIds: memoIds.map(String),
    deletedAt: new Date().toISOString(),
  };

  const index = rows.findIndex((journal) => journal.id === journalId);
  if (index >= 0) {
    rows[index] = tombstone;
  } else {
    rows.unshift(tombstone);
  }

  all[userId] = rows;
  writeAll(all);
  return true;
}

export function getCustomJournalById(userId, journalId) {
  if (!userId || !journalId) return null;
  return getCustomJournals(userId).find((journal) => journal.id === journalId) ?? null;
}

export function buildCustomJournalId() {
  return `custom-${Date.now()}`;
}
