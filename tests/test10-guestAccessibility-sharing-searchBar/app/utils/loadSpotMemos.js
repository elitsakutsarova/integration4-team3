// utility function to load the memos at a location

import { bootstrapAuthSession } from './authSession';
import {
  FEATURED_MEMO_LIMIT,
  fetchMemosAtPlace,
  MAX_MEMOS_PER_SPOT,
} from './memoQueries';
import { getSupabaseBrowserClient } from './supabase.client';

export async function loadSpotMemos(
  { placeId, lat, lng, locationName },
  { featuredLimit = FEATURED_MEMO_LIMIT, archiveLimit = MAX_MEMOS_PER_SPOT } = {},
) {
  await bootstrapAuthSession();

  const client = getSupabaseBrowserClient();
  const spot = { placeId, lat, lng, locationName };

  // Fetch up to archiveLimit once; slice for featured to avoid two identical queries.
  const archiveMemos = await fetchMemosAtPlace(client, spot, { limit: archiveLimit });
  const featuredMemos = archiveMemos.slice(0, featuredLimit);

  return {
    featuredMemos,
    archiveMemos,
    totalMemoCount: archiveMemos.length,
  };
}
