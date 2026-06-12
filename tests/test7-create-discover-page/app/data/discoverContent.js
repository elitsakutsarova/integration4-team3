export const DISCOVER_CATEGORIES = [
  { id: 'All', label: 'All' },
  { id: 'Food', label: 'Food', icon: 'food' },
  { id: 'Nightlife', label: 'Nightlife', icon: 'nightlife' },
  { id: 'Fashion', label: 'Fashion', icon: 'fashion' },
  { id: 'Art & culture', label: 'Art & culture', icon: 'art' },
  { id: 'Music', label: 'Music', icon: 'music' },
  { id: 'Random', label: 'Random', icon: 'random' },
];

export const HAPPENING_NOW = [
  {
    id: 'oh-honey',
    title: 'Oh Honey...',
    date: 'Sat, 13 Jun. 2026',
    location: 'Traum',
    tags: ['Music'],
    categories: ['Music', 'Nightlife'],
    image: '/discover/oh-honey.jpg',
    live: true,
  },
  {
    id: 'ben-techy',
    title: 'Ben Techy & MOIA',
    date: 'Sat, 13 Jun. 2026',
    location: 'Club Vaag',
    tags: ['Music'],
    categories: ['Music', 'Nightlife'],
    image: '/discover/ben-techy.jpg',
    live: true,
  },
  {
    id: 'groove-techno',
    title: 'Groove Techno',
    date: 'Sat, 13 Jun. 2026',
    location: 'Lokaal Talent',
    tags: ['Music'],
    categories: ['Music', 'Nightlife'],
    image: '/discover/groove-techno.jpg',
    live: true,
  },
];

export const UPCOMING = [
  {
    id: 'antiques',
    title: 'Antiques at Sint-Jansvliet',
    date: 'Sun, 14 Jun. 2026',
    location: 'Sint-Jansvliet',
    tags: ['Market'],
    categories: ['Art & culture', 'Random'],
    image: '/discover/antiques.jpg',
  },
  {
    id: 'lambermontmartre',
    title: 'Lambermontmartre',
    date: 'Sun, 14 Jun. 2026',
    location: 'Oudevaartplaats',
    tags: ['Market', 'Art'],
    categories: ['Art & culture', 'Random'],
    image: '/discover/lambermontmartre.jpg',
  },
  {
    id: 'flea-market',
    title: 'Flea market',
    date: 'Sun, 14 Jun. 2026',
    location: 'Dageraadplaats',
    tags: ['Market', 'Hidden gem'],
    categories: ['Random', 'Fashion'],
    image: '/discover/flea-market.jpg',
  },
];

export const PLACES_WORTH_MEMO = [
  {
    id: 'caffe-mundi',
    title: 'Caffe Mundi',
    location: 'Oude Beurs 24',
    tags: ['Food'],
    categories: ['Food'],
    image: '/discover/caffe-mundi.jpg',
  },
  {
    id: 'rush-rush',
    title: 'Rush Rush Caffee',
    location: 'Lange Altaarstraat 29',
    tags: ['Food'],
    categories: ['Food', 'Art & culture', 'Nightlife'],
    image: '/discover/rush-rush.jpg',
  },
  {
    id: 'delrey',
    title: 'DelRey',
    location: 'Appelmansstraat 5',
    tags: ['Food'],
    categories: ['Food', 'Fashion'],
    image: '/discover/delrey.jpg',
  },
];

export const HAPPENING_NOW_ALL = [...HAPPENING_NOW];

export const UPCOMING_ALL = [
  ...UPCOMING,
  {
    id: 'exotische-markt',
    title: 'Exotische markt',
    date: 'Mon, 15 Jun. 2026',
    location: 'Dageraadplaats',
    tags: ['Market'],
    categories: ['Random', 'Food'],
    image: '/discover/flea-market.jpg',
  },
];

export const PLACES_WORTH_MEMO_ALL = [
  {
    id: 'caffe-mundi',
    title: 'Caffe Mundi',
    location: 'Oude Beurs 24',
    tags: ['Food'],
    categories: ['Food'],
    image: '/discover/caffe-mundi.jpg',
  },
  {
    id: 'rush-rush-art',
    title: 'Rush Rush Caffee',
    location: 'Lange Altaarstraat 29',
    tags: ['Art & culture'],
    categories: ['Art & culture'],
    image: '/discover/rush-rush.jpg',
  },
  {
    id: 'delrey',
    title: 'DelRey',
    location: 'Appelmansstraat 5',
    tags: ['Food'],
    categories: ['Food'],
    image: '/discover/delrey.jpg',
  },
  {
    id: 'caffe-mundi-fashion',
    title: 'Caffe Mundi',
    location: 'Oude Beurs 24',
    tags: ['Fashion'],
    categories: ['Fashion'],
    image: '/discover/caffe-mundi.jpg',
  },
  {
    id: 'rush-rush-nightlife',
    title: 'Rush Rush Caffee',
    location: 'Lange Altaarstraat 29',
    tags: ['Nightlife'],
    categories: ['Nightlife'],
    image: '/discover/rush-rush.jpg',
  },
  {
    id: 'delrey-2',
    title: 'DelRey',
    location: 'Appelmansstraat 5',
    tags: ['Food'],
    categories: ['Food'],
    image: '/discover/delrey.jpg',
  },
];

function matchesCategory(item, category) {
  if (category === 'All') return true;
  if (category === 'Random') {
    return item.categories.includes('Random') || item.tags.includes('Hidden gem');
  }
  return item.categories.includes(category) || item.tags.includes(category);
}

function matchesSearch(item, query) {
  if (!query.trim()) return true;
  const haystack = [item.title, item.location, ...item.tags, ...(item.categories ?? [])]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

export function filterDiscoverItems(items, { category, query }) {
  return items.filter(
    item => matchesCategory(item, category) && matchesSearch(item, query),
  );
}
