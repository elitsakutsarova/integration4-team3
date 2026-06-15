// mock data for the discover page

import {
  HAPPENING_NOW,
  HAPPENING_NOW_ALL,
  PLACES_WORTH_MEMO,
  PLACES_WORTH_MEMO_ALL,
  UPCOMING_ALL,
} from './discoverContent';

export const FEATURED_MEMOS = [
  {
    id: 'memo-kebab',
    quote: 'I had the best kebab at 4AM here',
    location: 'Traum',
    image: '/discover/oh-honey.jpg',
  },
  {
    id: 'memo-vibes',
    quote: 'The vibes here are unmatched',
    location: 'Club Vaag',
    image: '/discover/ben-techy.jpg',
  },
];

const EVENT_DETAILS = {
  'oh-honey': {
    dateLabel: 'Saturday, 13 June',
    timeRange: '23:00 - 11:00',
    venueName: 'Traum',
    venueAddress: 'Verversrui 15',
    placeId: 'photon/W/495163772',
    ll: [51.226186, 4.4039538],
    about:
      'For the first time ever, we go all the way. The moment you’ve been waiting for... our first official in-club after moment, taking you straight through the night into the morning till 11:00.',
    websiteLabel: 'traumclub.com',
    websiteUrl: 'https://traumclub.com',
    mapsQuery: 'Verversrui 15, Antwerp',
    categoryBadge: 'music',
  },
  'ben-techy': {
    dateLabel: 'Saturday, 13 June',
    timeRange: '22:00 - 06:00',
    venueName: 'Club Vaag',
    venueAddress: 'Nationalestraat 86',
    placeId: 'photon/N/4935674425',
    ll: [51.2337413, 4.4034725],
    about:
      'Ben Techy and MOIA bring a night of deep grooves and hypnotic techno to one of Antwerp’s favourite underground rooms.',
    websiteLabel: 'clubvaag.be',
    websiteUrl: 'https://clubvaag.be',
    mapsQuery: 'Nationalestraat 86, Antwerp',
    categoryBadge: 'music',
  },
  'groove-techno': {
    dateLabel: 'Saturday, 13 June',
    timeRange: '21:00 - 04:00',
    venueName: 'Lokaal Talent',
    venueAddress: 'Sint-Jacobsmarkt 24',
    placeId: 'photon/W/495923902',
    ll: [51.2203686, 4.4108932],
    about:
      'Groove Techno returns with a stacked local lineup — expect rolling basslines and sunrise energy until the early hours.',
    websiteLabel: 'lokaaltalent.be',
    websiteUrl: 'https://lokaaltalent.be',
    mapsQuery: 'Sint-Jacobsmarkt 24, Antwerp',
    categoryBadge: 'music',
  },
  antiques: {
    dateLabel: 'Sunday, 14 June',
    timeRange: '09:00 - 17:00',
    venueName: 'Sint-Jansvliet',
    venueAddress: 'Sint-Jansvliet, Antwerp',
    placeId: 'photon/W/255929107',
    ll: [51.2184031, 4.3964363],
    about:
      'Browse antiques, curiosities and vintage finds at one of Antwerp’s classic Sunday markets.',
    websiteLabel: 'visitantwerpen.be',
    websiteUrl: 'https://visitantwerpen.be',
    mapsQuery: 'Sint-Jansvliet, Antwerp',
    categoryBadge: 'art',
  },
  lambermontmartre: {
    dateLabel: 'Sunday, 14 June',
    timeRange: '10:00 - 18:00',
    venueName: 'Oudevaartplaats',
    venueAddress: 'Oudevaartplaats, Antwerp',
    placeId: 'photon/W/178553518',
    ll: [51.2133659, 4.4091855],
    about:
      'Artists and makers fill the square with prints, ceramics and handmade treasures — Montmartre energy, Antwerp style.',
    websiteLabel: 'visitantwerpen.be',
    websiteUrl: 'https://visitantwerpen.be',
    mapsQuery: 'Oudevaartplaats, Antwerp',
    categoryBadge: 'art',
  },
  'flea-market': {
    dateLabel: 'Sunday, 14 June',
    timeRange: '08:00 - 14:00',
    venueName: 'Dageraadplaats',
    venueAddress: 'Dageraadplaats, Antwerp',
    placeId: 'photon/W/210459403',
    ll: [51.2075216, 4.4305347],
    about:
      'Dig through vintage clothes, vinyl and hidden gems at the neighbourhood flea market.',
    websiteLabel: 'visitantwerpen.be',
    websiteUrl: 'https://visitantwerpen.be',
    mapsQuery: 'Dageraadplaats, Antwerp',
    categoryBadge: 'random',
  },
  'exotische-markt': {
    dateLabel: 'Monday, 15 June',
    timeRange: '08:00 - 16:00',
    venueName: 'Dageraadplaats',
    venueAddress: 'Dageraadplaats, Antwerp',
    placeId: 'photon/W/210459403',
    ll: [51.2075216, 4.4305347],
    about:
      'Spices, street food and global flavours converge at Antwerp’s colourful exotic market.',
    websiteLabel: 'visitantwerpen.be',
    websiteUrl: 'https://visitantwerpen.be',
    mapsQuery: 'Dageraadplaats, Antwerp',
    categoryBadge: 'food',
  },
};

const PLACE_DETAILS = {
  'caffe-mundi': {
    about: 'Caffe Mundi is a cosy café in the heart of Antwerp, perfect for a slow morning coffee or an afternoon break.',
    placeId: 'photon/N/5123359322',
    ll: [51.2218334, 4.4007729],
    facts: [
      { emoji: '☕', text: 'Coffee and pastries' },
      { emoji: '📍', text: 'Steps from the historic exchange' },
      { emoji: '⏰', text: 'Open every day from 8:00 till 18:00' },
    ],
    mapsQuery: 'Oude Beurs 24, Antwerp',
    collage: ['/discover/caffe-mundi.jpg', '/discover/rush-rush.jpg', '/discover/delrey.jpg', '/discover/caffe-mundi.jpg'],
    categoryBadge: 'food',
  },
  'rush-rush': {
    about: 'Rush Rush Caffee serves specialty coffee with a creative twist in a bright, welcoming space.',
    placeId: 'photon/N/7235177737',
    ll: [51.2067289, 4.4326251],
    facts: [
      { emoji: '☕', text: 'Specialty coffee and light bites' },
      { emoji: '📍', text: 'Near the cathedral quarter' },
      { emoji: '⏰', text: 'Open weekdays from 7:30 till 19:00' },
    ],
    mapsQuery: 'Lange Altaarstraat 29, Antwerp',
    collage: ['/discover/rush-rush.jpg', '/discover/caffe-mundi.jpg', '/discover/delrey.jpg', '/discover/rush-rush.jpg'],
    categoryBadge: 'food',
  },
  delrey: {
    about: 'DelRey is a neighbourhood favourite for brunch, cakes and all-day coffee in Zuid.',
    placeId: 'photon/W/139822238',
    ll: [51.2171137, 4.4177315],
    facts: [
      { emoji: '🥐', text: 'Brunch and homemade cakes' },
      { emoji: '📍', text: 'South Antwerp, Appelmansstraat' },
      { emoji: '⏰', text: 'Open Tue–Sun from 9:00 till 17:30' },
    ],
    mapsQuery: 'Appelmansstraat 5, Antwerp',
    collage: ['/discover/delrey.jpg', '/discover/caffe-mundi.jpg', '/discover/rush-rush.jpg', '/discover/delrey.jpg'],
    categoryBadge: 'food',
  },
};

function resolvePlaceBaseId(id) {
  if (PLACE_DETAILS[id]) return id;
  if (id.startsWith('caffe-mundi')) return 'caffe-mundi';
  if (id.startsWith('rush-rush')) return 'rush-rush';
  if (id.startsWith('delrey')) return 'delrey';
  return id;
}

function defaultEventDetail(item) {
  return {
    dateLabel: item.date.replace(/^(\w+),\s*/, '').replace(/\.\s*\d{4}$/, ''),
    timeRange: 'See venue',
    venueName: item.location,
    venueAddress: item.location,
    about: `Discover ${item.title} in Antwerp — save it to your favourites and plan your visit.`,
    websiteLabel: 'visitantwerpen.be',
    websiteUrl: 'https://visitantwerpen.be',
    mapsQuery: `${item.location}, Antwerp`,
    categoryBadge: item.tags[0]?.toLowerCase() ?? 'random',
  };
}

function defaultPlaceDetail(item) {
  return {
    about: `${item.title} is worth a memo — drop by and capture the moment.`,
    facts: [
      { emoji: '📍', text: item.location },
      { emoji: '☕', text: item.tags[0] ?? 'Place' },
    ],
    mapsQuery: `${item.location}, Antwerp`,
    collage: [item.image, item.image, item.image, item.image],
    categoryBadge: item.tags[0]?.toLowerCase() ?? 'food',
  };
}

export function getAllDiscoverEvents() {
  return [...HAPPENING_NOW_ALL, ...UPCOMING_ALL];
}

export function getAllDiscoverPlaces() {
  return PLACES_WORTH_MEMO_ALL;
}

export function getDiscoverEventById(id) {
  const item = getAllDiscoverEvents().find(entry => entry.id === id);
  if (!item) return null;
  const detail = EVENT_DETAILS[id] ?? defaultEventDetail(item);
  return { ...item, ...detail };
}

/** Map pins for live discover events — requires Photon placeId + coordinates. */
export function buildInitialMapEvents() {
  return HAPPENING_NOW.flatMap((item, index) => {
    const event = getDiscoverEventById(item.id);
    if (!event?.placeId || !event?.ll) return [];

    return [{
      id: 101 + index,
      ll: event.ll,
      label: event.venueName ?? event.location,
      title: event.title,
      tags: event.tags,
      likes: index === 0 ? 268 : 94,
      badge: event.live ? 'Now' : 'Tonight',
      image: event.image,
      discoverEventId: event.id,
      placeId: event.placeId,
    }];
  });
}

function findDiscoverPlaceItem(id, baseId) {
  const pools = [PLACES_WORTH_MEMO, PLACES_WORTH_MEMO_ALL];

  for (const pool of pools) {
    const exact = pool.find(entry => entry.id === id);
    if (exact) return exact;

    const byBase = pool.find(entry => entry.id === baseId);
    if (byBase) return byBase;

    const byPrefix = pool.find(entry => resolvePlaceBaseId(entry.id) === baseId);
    if (byPrefix) return byPrefix;
  }

  return null;
}

function syntheticPlaceFromDetails(baseId, detail) {
  const titleFromId = baseId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    id: baseId,
    title: titleFromId,
    location: detail.mapsQuery?.split(',')[0]?.trim() ?? 'Antwerp',
    tags: [detail.categoryBadge ?? 'Food'],
    categories: [detail.categoryBadge ?? 'Food'],
    image: detail.collage?.[0] ?? '/discover/caffe-mundi.jpg',
  };
}

export function getDiscoverPlaceById(id) {
  const baseId = resolvePlaceBaseId(id);
  const staticDetail = PLACE_DETAILS[baseId];

  let item = findDiscoverPlaceItem(id, baseId);
  if (!item && staticDetail) {
    item = syntheticPlaceFromDetails(baseId, staticDetail);
  }
  if (!item) return null;

  const detail = staticDetail ?? defaultPlaceDetail(item);
  return { ...item, id: baseId, ...detail };
}
