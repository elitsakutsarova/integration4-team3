/** Groups user memos into Antwerp trip journals (albums). */

/** Inactivity gap that ends a trip — 1 hour for testing, production uses 2 weeks. */
export const TRIP_GAP_MS = 15000; //15 seconds for testing

const JOURNAL_TITLE = 'Antwerp Getaway';

function getMemoTimestamp(memo) {
  if (!memo?.createdAt) return null;
  const ts = new Date(memo.createdAt).getTime();
  return Number.isFinite(ts) && ts > 0 ? ts : null;
}

function partitionMemosByTimestamp(memos) {
  const dated = [];
  const undated = [];

  for (const memo of memos) {
    if (getMemoTimestamp(memo) == null) undated.push(memo);
    else dated.push(memo);
  }

  return { dated, undated };
}

function formatMonthLabel(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });
}

function formatDateRange(memos) {
  const timestamps = memos
    .map(getMemoTimestamp)
    .filter((ts) => ts != null);

  if (!timestamps.length) return '';

  const start = Math.min(...timestamps);
  const end = Math.max(...timestamps);
  const fmt = (ts) =>
    new Date(ts).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  if (new Date(start).toDateString() === new Date(end).toDateString()) {
    return fmt(start);
  }
  return `${fmt(start)} – ${fmt(end)}`;
}

function buildJournalId(memos, index) {
  const firstTs = getMemoTimestamp(memos[0]) ?? Date.now();
  return `antwerp-${firstTs}-${index}`;
}

export function getJournalDisplayType(memos) {
  const withMedia = memos.filter((m) => m.mediaPreview?.url);
  const textOnly = memos.filter((m) => !m.mediaPreview?.url);

  if (withMedia.length === 0) return 'text-only';
  if (textOnly.length === 0) return 'photos';
  return 'photos-text';
}

function groupMemosIntoAlbums(memos) {
  if (!memos.length) return [];

  const { dated, undated } = partitionMemosByTimestamp(memos);
  if (!dated.length) return undated.length ? [undated] : [];

  const sorted = [...dated].sort((a, b) => getMemoTimestamp(a) - getMemoTimestamp(b));
  const albums = [];
  let current = [sorted[0]];

  for (let i = 1; i < sorted.length; i += 1) {
    const gap = getMemoTimestamp(sorted[i]) - getMemoTimestamp(sorted[i - 1]);
    if (gap > TRIP_GAP_MS) {
      albums.push(current);
      current = [sorted[i]];
    } else {
      current.push(sorted[i]);
    }
  }

  albums.push(current);

  if (undated.length) {
    albums[albums.length - 1].push(...undated);
  }

  return albums;
}

function buildJournalFromAlbum(albumMemos, index, totalAlbums, now) {
  const timestamps = albumMemos
    .map(getMemoTimestamp)
    .filter((ts) => ts != null);
  const lastTs = timestamps.length ? Math.max(...timestamps) : now;
  const firstTs = timestamps.length ? Math.min(...timestamps) : now;
  const isActive = now - lastTs <= TRIP_GAP_MS;
  const displayType = getJournalDisplayType(albumMemos);
  const photoMemos = albumMemos.filter((m) => m.mediaPreview?.url);
  const textMemos = albumMemos.filter((m) => !m.mediaPreview?.url);

  // Titles are derived at render time from album position — not persisted.
  // When a new trip album appears, existing labels renumber (newest = 1 after reverse).
  const title =
    totalAlbums === 1 ? JOURNAL_TITLE : `${JOURNAL_TITLE} ${totalAlbums - index}`;

  return {
    id: buildJournalId(albumMemos, index),
    title,
    monthLabel: formatMonthLabel(firstTs),
    dateRange: formatDateRange(albumMemos),
    description: `Your Antwerp memories from ${formatMonthLabel(firstTs)}.`,
    memos: albumMemos,
    memoCount: albumMemos.length,
    memoryIds: albumMemos.map((m) => m.id),
    isActive,
    displayType,
    coverPhotos: photoMemos.slice(0, 2).map((m) => m.mediaPreview.url),
    textQuotes: textMemos.slice(0, 2).map((m) => m.quote),
    createdAt: new Date(firstTs).toISOString(),
  };
}

function getJournalCreatedAt(journal) {
  const ts = new Date(journal?.createdAt ?? 0).getTime();
  return Number.isFinite(ts) ? ts : 0;
}

function sortJournalsNewestFirst(journals) {
  return [...journals].sort(
    (a, b) => getJournalCreatedAt(b) - getJournalCreatedAt(a),
  );
}

/** Build trip journals from the user's created memos, newest first. */
export function buildJournalsFromMemos(memos, customJournals = []) {
  const activeRecords = (customJournals ?? []).filter((journal) => !journal.deleted);
  const hiddenMemoIds = new Set(
    (customJournals ?? []).flatMap((journal) => journal.memoIds ?? []),
  );
  const autoMemos = (memos ?? []).filter((memo) => !hiddenMemoIds.has(String(memo.id)));
  const now = Date.now();

  const autoJournals = !autoMemos.length
    ? []
    : groupMemosIntoAlbums(autoMemos)
        .map((albumMemos, index, albums) =>
          buildJournalFromAlbum(albumMemos, index, albums.length, now),
        )
        .reverse();

  const manualJournals = activeRecords.map((record) =>
    buildCustomJournal(record, memos ?? []),
  );

  const manualJournalIds = new Set(manualJournals.map((journal) => journal.id));
  const dedupedAutoJournals = autoJournals.filter(
    (journal) => !manualJournalIds.has(journal.id),
  );

  const seenIds = new Set();
  const journals = [...manualJournals, ...dedupedAutoJournals].filter((journal) => {
    if (seenIds.has(journal.id)) return false;
    seenIds.add(journal.id);
    return true;
  });

  return sortJournalsNewestFirst(journals);
}

function buildCustomJournal(record, memos) {
  const memoById = new Map(memos.map((memo) => [memo.id, memo]));
  const albumMemos = (record.memoIds ?? [])
    .map((id) => memoById.get(id))
    .filter(Boolean);
  const displayType = getJournalDisplayType(albumMemos);
  const photoMemos = albumMemos.filter((m) => m.mediaPreview?.url);
  const textMemos = albumMemos.filter((m) => !m.mediaPreview?.url);
  const startTs = record.startDate
    ? new Date(`${record.startDate}T12:00:00`).getTime()
    : Date.now();

  return {
    id: record.id,
    title: record.title,
    monthLabel: formatMonthLabel(startTs),
    dateRange: formatCustomDateRange(record.startDate, record.endDate),
    description: record.description,
    memos: albumMemos,
    memoCount: albumMemos.length,
    memoryIds: albumMemos.map((m) => m.id),
    isActive: false,
    isCustom: true,
    displayType,
    coverPhotos: photoMemos.slice(0, 2).map((m) => m.mediaPreview.url),
    textQuotes: textMemos.slice(0, 2).map((m) => m.quote),
    createdAt: record.createdAt ?? new Date(startTs).toISOString(),
    startDate: record.startDate ?? '',
    endDate: record.endDate ?? '',
  };
}

function formatCustomDateRange(startDate, endDate) {
  const fmt = (value) => {
    if (!value) return '';
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const start = fmt(startDate);
  const end = fmt(endDate);
  if (!start) return '';
  if (!end || start === end) return start;
  return `${start} – ${end}`;
}

export function findJournalById(memos, journalId, customJournals = []) {
  return buildJournalsFromMemos(memos, customJournals).find((j) => j.id === journalId) ?? null;
}
