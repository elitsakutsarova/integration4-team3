import {
  HAPPENING_NOW_ALL,
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

export function getDiscoverPlaceById(id) {
  const item = getAllDiscoverPlaces().find(entry => entry.id === id);
  if (!item) return null;
  const baseId = resolvePlaceBaseId(id);
  const detail = PLACE_DETAILS[baseId] ?? defaultPlaceDetail(item);
  return { ...item, ...detail };
}
