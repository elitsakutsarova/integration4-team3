import { mapMemoRowToPin } from './memoStore';

const MEMO_COLUMNS_BASE =
  'id, quote, lat, lng, location, tags, media_url, media_type, created_at';
const MEMO_COLUMNS = `${MEMO_COLUMNS_BASE}, place_id`;

export const FEATURED_MEMO_LIMIT = 10;
export const MAX_MEMOS_PER_SPOT = 50;
const SAME_SPOT_QUERY_LIMIT = 50;
const LOCATION_MATCH_KM = 0.05;

function isMissingPlaceIdColumn(error) {
  const msg = String(error?.message ?? error?.details ?? '').toLowerCase();
  return msg.includes('place_id');
}

async function queryMemos(client, buildQuery) {
  let result = await buildQuery(MEMO_COLUMNS);
  if (result.error && isMissingPlaceIdColumn(result.error)) {
    result = await buildQuery(MEMO_COLUMNS_BASE);
  }
  return result;
}

export function distanceKm(lat1, lng1, lat2, lng2) {
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  return Math.sqrt(dLat * dLat + dLng * dLng) * 111;
}

function sortByNewest(rows) {
  return [...rows].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function absorbRows(into, rows) {
  if (!Array.isArray(rows)) return;
  for (const row of rows) {
    into.set(row.id, row);
  }
}

/** Fetch memos for a spot — merges place_id, location name, and nearby coords. */
export async function fetchMemosAtPlace(
  client,
  { placeId, lat, lng, locationName },
  { limit = FEATURED_MEMO_LIMIT } = {},
) {
  if (!client) return [];

  const merged = new Map();
  const tasks = [];

  if (placeId) {
    tasks.push(queryMemos(client, columns =>
      client
        .from('memos')
        .select(columns)
        .eq('place_id', placeId)
        .order('created_at', { ascending: false })
        .limit(SAME_SPOT_QUERY_LIMIT),
    ));
  }

  if (locationName) {
    tasks.push(queryMemos(client, columns =>
      client
        .from('memos')
        .select(columns)
        .eq('location', locationName)
        .order('created_at', { ascending: false })
        .limit(SAME_SPOT_QUERY_LIMIT),
    ));
  }

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const delta = LOCATION_MATCH_KM / 111;
    tasks.push(queryMemos(client, columns =>
      client
        .from('memos')
        .select(columns)
        .gte('lat', lat - delta)
        .lte('lat', lat + delta)
        .gte('lng', lng - delta)
        .lte('lng', lng + delta)
        .order('created_at', { ascending: false })
        .limit(SAME_SPOT_QUERY_LIMIT),
    ));
  }

  const results = await Promise.all(tasks);
  for (const { data, error } of results) {
    if (!error) absorbRows(merged, data);
  }

  return sortByNewest([...merged.values()])
    .filter(row =>
      !Number.isFinite(lat)
      || !Number.isFinite(lng)
      || distanceKm(row.lat, row.lng, lat, lng) <= LOCATION_MATCH_KM,
    )
    .slice(0, limit)
    .map(mapMemoRowToPin);
}

export async function countMemosAtSpot(client, params, { excludeMemoId } = {}) {
  const memos = await fetchMemosAtPlace(client, params, { limit: MAX_MEMOS_PER_SPOT + 1 });
  const filtered = excludeMemoId
    ? memos.filter((memo) => memo.id !== excludeMemoId)
    : memos;
  return filtered.length;
}
