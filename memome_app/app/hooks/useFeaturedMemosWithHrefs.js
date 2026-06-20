import { useEffect, useMemo, useState } from 'react';
import { pickOldestMemos } from '../utils/profileMemos';
import { enrichMemosWithLocationHrefs } from '../utils/memoLocationHrefs';

export function useFeaturedMemosWithHrefs(memos) {
  const featured = useMemo(() => pickOldestMemos(memos), [memos]);
  const [enriched, setEnriched] = useState(featured);

  useEffect(() => {
    setEnriched(featured);

    let cancelled = false;
    void enrichMemosWithLocationHrefs(featured).then((next) => {
      if (!cancelled) setEnriched(next);
    });

    return () => {
      cancelled = true;
    };
  }, [featured]);

  return enriched;
}
