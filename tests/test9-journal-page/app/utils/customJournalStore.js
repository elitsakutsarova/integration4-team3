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
  all[userId] = [journal, ...existing];
  writeAll(all);
}

export function buildCustomJournalId() {
  return `custom-${Date.now()}`;
}
