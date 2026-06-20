import { buildLocationDetailHref } from './locationHref';
import { fetchLocationHrefFromApi } from './locationHrefClient';

export function withSyncLocationHref(memo) {
  if (memo.locationHref) return memo;

  const locationHref = buildLocationDetailHref({
    placeId: memo.placeId,
    lat: memo.ll?.[0],
    lng: memo.ll?.[1],
    name: memo.location,
  });

  return locationHref ? { ...memo, locationHref } : memo;
}

export function enrichMemosWithLocationHrefsSync(memos) {
  return memos.map(withSyncLocationHref);
}

async function enrichMemoLocationHref(memo) {
  const locationHref = await fetchLocationHrefFromApi({
    placeId: memo.placeId,
    lat: memo.ll?.[0],
    lng: memo.ll?.[1],
    name: memo.location,
  });
  return locationHref ? { ...memo, locationHref } : memo;
}

export async function enrichMemosWithLocationHrefs(memos) {
  const syncEnriched = enrichMemosWithLocationHrefsSync(memos);
  const pending = syncEnriched.filter(
    memo => !memo.locationHref && memo.location && Number.isFinite(memo.ll?.[0]),
  );

  if (!pending.length) return syncEnriched;

  const resolved = await Promise.all(pending.map(enrichMemoLocationHref));
  const byId = new Map(resolved.map(memo => [memo.id, memo]));
  return syncEnriched.map(memo => byId.get(memo.id) ?? memo);
}
