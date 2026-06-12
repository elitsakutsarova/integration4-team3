// utility function to load the memos at a location

import { bootstrapAuthSession } from './authSession';
import {
  countMemosAtSpot,
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

  const [featuredMemos, archiveMemos] = await Promise.all([
    fetchMemosAtPlace(client, spot, { limit: featuredLimit }),
    fetchMemosAtPlace(client, spot, { limit: archiveLimit }),
  ]);

  return {
    featuredMemos,
    archiveMemos,
    totalMemoCount: archiveMemos.length,
  };
}
