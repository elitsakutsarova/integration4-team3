import { useEffect, useState } from 'react';
import { getDiscoverEventById } from '../data/discoverDetails';
import { fetchLocationHrefFromApi } from '../utils/locationHrefClient';
import { isPhotonPlaceId } from '../utils/placeId';

export function useEventVenueHrefs(eventItems) {
  const itemKey = eventItems.map(item => item.id).join(',');
  const [hrefById, setHrefById] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function resolveAll() {
      const pairs = await Promise.all(
        eventItems.map(async (item) => {
          const event = getDiscoverEventById(item.id);
          if (!isPhotonPlaceId(event?.placeId) || !Array.isArray(event?.ll)) {
            return [item.id, null];
          }

          const href = await fetchLocationHrefFromApi({
            placeId: event.placeId,
            lat: event.ll[0],
            lng: event.ll[1],
            name: event.venueName ?? event.location,
          });
          return [item.id, href];
        }),
      );

      if (cancelled) return;
      setHrefById(Object.fromEntries(pairs.filter(([, href]) => href)));
    }

    void resolveAll();
    return () => {
      cancelled = true;
    };
  }, [itemKey]);

  return hrefById;
}
