import { useEffect, useMemo, useState } from 'react';
import { pickOldestMemos } from '../utils/profileMemos';
import { fetchLocationHrefFromApi } from '../utils/locationHrefClient';

async function enrichWithLocationHref(memo) {
  const locationHref = await fetchLocationHrefFromApi({
    placeId: memo.placeId,
    lat: memo.ll?.[0],
    lng: memo.ll?.[1],
    name: memo.location,
  });
  return { ...memo, locationHref };
}

export function useFeaturedMemosWithHrefs(memos) {
  const featured = useMemo(() => pickOldestMemos(memos), [memos]);
  const [enriched, setEnriched] = useState(featured);

  // Async client enrichment — resolve location page links for featured memo cards.
  useEffect(() => {
    setEnriched(featured);

    let cancelled = false;
    Promise.all(featured.map(enrichWithLocationHref)).then((next) => {
      if (!cancelled) setEnriched(next);
    });

    return () => {
      cancelled = true;
    };
  }, [featured]);

  return enriched;
}
