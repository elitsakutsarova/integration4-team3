import { getDiscoverEventById, getDiscoverPlaceById } from '../data/discoverDetails';
import { isPhotonPlaceId } from './placeId';
import { getPhotonFaveSnapshots } from './photonFaveSnapshots';

const DEFAULT_SPOT_IMAGE = '/discover/caffe-mundi.jpg';

function photonSnapshotToPlace(placeId, meta) {
  return {
    id: placeId,
    title: meta.title,
    location: meta.location ?? 'Antwerpen, Belgium',
    image: meta.image ?? DEFAULT_SPOT_IMAGE,
    tags: meta.tags ?? ['Place'],
    categories: meta.categories ?? [],
  };
}

export function resolveDiscoverFaveItems(faves, type, userId = null) {
  const source = type ? faves.filter(fave => fave.type === type) : faves;
  const photonSnapshots = getPhotonFaveSnapshots(userId);

  return source
    .map(fave => {
      if (fave.type === 'event') {
        const item = getDiscoverEventById(fave.id);
        return item ? { type: 'event', item, savedAt: fave.savedAt } : null;
      }

      if (fave.type === 'place') {
        const item = getDiscoverPlaceById(fave.id);
        if (item) return { type: 'place', item, savedAt: fave.savedAt };

        if (isPhotonPlaceId(fave.id)) {
          const meta = photonSnapshots[fave.id];
          if (meta) {
            return {
              type: 'place',
              item: photonSnapshotToPlace(fave.id, meta),
              savedAt: fave.savedAt,
            };
          }
        }

        return null;
      }

      return null;
    })
    .filter(Boolean);
}
