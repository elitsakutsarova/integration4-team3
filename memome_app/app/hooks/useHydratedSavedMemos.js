import { useEffect, useMemo, useState } from 'react';
import { hydrateSavedMemos } from '../utils/hydrateSavedMemos';
import {
  enrichMemosWithLocationHrefs,
  enrichMemosWithLocationHrefsSync,
} from '../utils/memoLocationHrefs';

/** Show sync favourites immediately, then hydrate DB memos and location links in the background. */
export function useHydratedSavedMemos(savedEntries, initialMemos) {
  const [memos, setMemos] = useState(initialMemos);
  const [pending, setPending] = useState(
    () => savedEntries.length > 0 && initialMemos.length === 0,
  );

  useEffect(() => {
    setMemos(initialMemos);
    setPending(savedEntries.length > 0 && initialMemos.length === 0);
  }, [initialMemos, savedEntries.length]);

  const savedMemoIdsKey = useMemo(
    () => savedEntries.map(entry => entry.id).join('|'),
    [savedEntries],
  );

  useEffect(() => {
    if (!savedEntries.length) {
      setPending(false);
      return undefined;
    }

    let cancelled = false;

    void (async () => {
      const hydrated = await hydrateSavedMemos(savedEntries);
      if (cancelled) return;

      setMemos(enrichMemosWithLocationHrefsSync(hydrated));
      setPending(false);

      const enriched = await enrichMemosWithLocationHrefs(hydrated);
      if (!cancelled) setMemos(enriched);
    })();

    return () => {
      cancelled = true;
    };
  }, [savedEntries, savedMemoIdsKey]);

  return { memos, pending };
}
