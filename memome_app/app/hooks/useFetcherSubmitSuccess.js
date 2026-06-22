import { useEffect, useRef } from 'react';

/**
 * Runs once after a fetcher submission settles idle with a successful payload.
 * Ignores stale fetcher.data until a new submit/load cycle starts.
 */
export function useFetcherSubmitSuccess(fetcher, { when, onSuccess }) {
  const handledRef = useRef(false);
  const sawSubmitRef = useRef(false);
  const whenRef = useRef(when);
  const onSuccessRef = useRef(onSuccess);

  whenRef.current = when;
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (fetcher.state === 'submitting' || fetcher.state === 'loading') {
      sawSubmitRef.current = true;
      handledRef.current = false;
      return;
    }

    if (fetcher.state !== 'idle' || handledRef.current || !sawSubmitRef.current) return;

    sawSubmitRef.current = false;
    if (!whenRef.current(fetcher.data)) return;

    handledRef.current = true;
    onSuccessRef.current(fetcher.data);
  }, [fetcher.state, fetcher.data]);
}
