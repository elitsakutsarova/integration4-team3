import { redirect } from 'react-router';
import { getAuthSnapshot } from './authSession';
import { paths } from './appPaths';
import { getCustomJournals } from './customJournalStore';
import { findJournalById } from './journalBuilder';
import { fetchCreatedMemosByUser } from './memoStore';
import { getCreatedMemosSnapshot } from './sessionCollectionsSnapshot';

/** Redirect to journals list when :id does not resolve in client storage. */
export async function requireJournalClientLoader({ params }) {
  const { user } = getAuthSnapshot();
  const userId = user?.id ?? null;
  const customJournals = getCustomJournals(userId);

  let createdMemos = getCreatedMemosSnapshot();
  let journal = findJournalById(createdMemos, params.id, customJournals);

  if (!journal && userId) {
    createdMemos = await fetchCreatedMemosByUser(userId);
    journal = findJournalById(createdMemos, params.id, customJournals);
  }

  if (!journal) {
    throw redirect(paths.journals);
  }

  return null;
}
