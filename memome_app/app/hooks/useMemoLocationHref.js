import { useEffect, useRef, useState } from 'react';
import { buildLocationDetailHref } from '../utils/locationHref';
import { fetchLocationHrefFromApi } from '../utils/locationHrefClient';

function resolveSyncLocationHref(pin) {
  if (!pin) return null;
  if (pin.locationHref) return pin.locationHref;

  return buildLocationDetailHref({
    placeId: pin.placeId,
    lat: pin.ll?.[0],
    lng: pin.ll?.[1],
    name: pin.location,
  });
}

/** Call from a stable parent (MapView) — not from remounting sheet children. */
export function useMemoLocationHref(pin) {
  const requestIdRef = useRef(0);
  const [locationHref, setLocationHref] = useState(() => resolveSyncLocationHref(pin));

  useEffect(() => {
    const syncHref = resolveSyncLocationHref(pin);
    if (syncHref) {
      setLocationHref(syncHref);
      return undefined;
    }

    if (!pin?.id || !pin.location || !Number.isFinite(pin.ll?.[0])) {
      setLocationHref(null);
      return undefined;
    }

    const requestId = ++requestIdRef.current;
    setLocationHref(null);

    let cancelled = false;
    void fetchLocationHrefFromApi({
      placeId: pin.placeId,
      lat: pin.ll[0],
      lng: pin.ll[1],
      name: pin.location,
    }).then(href => {
      if (cancelled || requestIdRef.current !== requestId) return;
      setLocationHref(href);
    });

    return () => {
      cancelled = true;
    };
  }, [pin?.id, pin?.locationHref, pin?.placeId, pin?.location, pin?.ll?.[0], pin?.ll?.[1]]);

  return locationHref;
}
