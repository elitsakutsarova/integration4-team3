// utility that takes the user's saved favourites list and converts it into full objects

import { getDiscoverEventById, getDiscoverPlaceById } from '../data/discoverDetails';

export function resolveDiscoverFaveItems(faves, type) {
  const source = type ? faves.filter(fave => fave.type === type) : faves;

  return source
    .map(fave => {
      if (fave.type === 'event') {
        const item = getDiscoverEventById(fave.id);
        return item ? { type: 'event', item, savedAt: fave.savedAt } : null;
      }

      if (fave.type === 'place') {
        const item = getDiscoverPlaceById(fave.id);
        return item ? { type: 'place', item, savedAt: fave.savedAt } : null;
      }

      return null;
    })
    .filter(Boolean);
}
