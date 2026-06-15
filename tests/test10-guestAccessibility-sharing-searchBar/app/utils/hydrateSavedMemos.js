// utility to hydrate the saved memos

import { GROTE_MARKT_CLUSTER_MEMORIES } from '../data/groteMarktClusterMemories';
import { MOCK_MEMORIES } from '../data/mockUser';
import { fetchMemosByIds } from './memoStore';

const DEMO_MEMO_BY_ID = new Map(
  [...MOCK_MEMORIES, ...GROTE_MARKT_CLUSTER_MEMORIES].map(memo => [String(memo.id), memo]),
);

/** Resolve heart-saved memo ids to full pin data (DB + demo map memos). */
export async function hydrateSavedMemos(savedEntries) {
  const ids = savedEntries.map(entry => String(entry.id));
  if (!ids.length) return [];

  const dbMemos = await fetchMemosByIds(ids);
  const dbById = new Map(dbMemos.map(memo => [String(memo.id), memo]));

  return savedEntries
    .map(entry => dbById.get(String(entry.id)) ?? DEMO_MEMO_BY_ID.get(String(entry.id)))
    .filter(Boolean);
}
