/** 45 demo memories packed around Grote Markt — for map cluster testing. */

const CENTER = [51.2220, 4.4025];

const QUOTES = [
  'Waffles at the market hit different',
  'Street musician made my whole afternoon',
  'Found the tiniest bookshop ever',
  'Rain on the cobblestones — so cinematic',
  'Shared fries with strangers, 10/10',
  'Golden hour on the guild houses',
  'Hot chocolate break between shops',
  'Could hear bells from every corner',
  'Sketching facades until my hand cramped',
  'Best people-watching spot in town',
  'Stumbled into a pop-up art stall',
  'Late lunch that turned into dinner',
  'The square smells like speculoos',
  'Tourist map useless, got happily lost',
  'Met a local who told ghost stories',
  'Bike bells and tram bells symphony',
  'Sat on the steps and just breathed',
  'Polaroid of friends mid-laugh',
  'Market flowers everywhere you look',
  'Old town maze — every turn prettier',
  'Cheese sample #7 was the winner',
  'Pigeons are the unofficial mascots',
  'Night lights made it feel like a film set',
  'Morning coffee on a terrace',
  'Heard three languages in five minutes',
  'Tiny alley with huge personality',
  'Antwerp energy is unmatched',
  'Postcard view at every angle',
  'Saved this corner for last day',
  'Already planning to come back',
];

const PLACES = [
  'Grote Markt',
  'Handschoenmarkt',
  'Gildekamersstraat',
  'Oude Beurs',
  'Sint-Paulusstraat',
  'Korte Gasthuisstraat',
  'Lange Koepoortstraat',
  'Schoenmarkt',
  'Melkmarkt',
  'Eiermarkt',
  'Oude Koornmarkt',
  'Sint-Katelijnevest',
  'Nationalstraat',
  'Kammenstraat',
  'Wiegstraat',
];

const TAG_POOL = ['Food', 'Sightseeing', 'Classic', 'Hidden gem', 'Local', 'Nightlife'];

function offsetForIndex(i) {
  const a = ((i * 47 + 13) % 360) * (Math.PI / 180);
  const r = 0.00035 + ((i * 31) % 65) * 0.000055;
  const lat = CENTER[0] + r * Math.cos(a);
  const lng = CENTER[1] + (r * Math.sin(a)) / Math.cos((CENTER[0] * Math.PI) / 180);
  return [lat, lng];
}

export const GROTE_MARKT_CLUSTER_MEMORIES = Array.from({ length: 45 }, (_, i) => ({
  id: 1000 + i,
  ll: offsetForIndex(i),
  quote: QUOTES[i % QUOTES.length],
  location: PLACES[i % PLACES.length],
  tags: [TAG_POOL[i % TAG_POOL.length], 'Grote Markt area'],
  date: 'Sat, 28 Aug, 2026',
  mediaPreview: null,
}));
