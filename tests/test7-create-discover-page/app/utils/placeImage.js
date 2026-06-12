/**
 * Resolve storefront / venue photos from OpenStreetMap tags and Wikidata.
 */

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const USER_AGENT = 'MemoMe/1.0 (+https://github.com/devine-integration; place images)';
const OVERPASS_TIMEOUT_MS = 2000;

const OSM_ELEMENT = { N: 'node', W: 'way', R: 'relation' };

function commonsFileUrl(fileName, width = 800) {
  const normalized = String(fileName).replace(/^File:/i, '').trim();
  if (!normalized) return null;
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(normalized)}?width=${width}`;
}

function isAllowedImageUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function pushUniqueUrl(urls, url) {
  if (!url || !isAllowedImageUrl(url) || urls.includes(url)) return;
  urls.push(url);
}

function urlsFromOsmTags(tags) {
  const urls = [];

  if (tags.image) pushUniqueUrl(urls, tags.image);

  for (const [key, value] of Object.entries(tags)) {
    if (!value) continue;
    if (key.startsWith('image:')) pushUniqueUrl(urls, value);
    if (key === 'wikimedia_commons') pushUniqueUrl(urls, commonsFileUrl(value));
  }

  return urls;
}

async function fetchOverpassTags(osmType, osmId) {
  const element = OSM_ELEMENT[osmType];
  if (!element || !osmId) return null;

  const query = `[out:json][timeout:5];${element}(${osmId});out tags;`;
  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: new URLSearchParams({ data: query }),
    signal: AbortSignal.timeout(OVERPASS_TIMEOUT_MS),
  });

  if (!response.ok) return null;

  const payload = await response.json();
  const elementData = payload?.elements?.[0];
  return elementData?.tags ?? null;
}

async function wikidataImageUrl(qid) {
  if (!qid?.startsWith('Q')) return null;

  const response = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`, {
    headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(OVERPASS_TIMEOUT_MS),
  });
  if (!response.ok) return null;

  const payload = await response.json();
  const fileName = payload?.entities?.[qid]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  return fileName ? commonsFileUrl(fileName) : null;
}

async function wikipediaImageUrl(wikipediaTag) {
  const separator = wikipediaTag.indexOf(':');
  if (separator <= 0) return null;

  const lang = wikipediaTag.slice(0, separator);
  const title = wikipediaTag.slice(separator + 1);
  if (!lang || !title) return null;

  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'pageimages',
    piprop: 'thumbnail',
    pithumbsize: '800',
    format: 'json',
  });

  const response = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`, {
    headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(OVERPASS_TIMEOUT_MS),
  });
  if (!response.ok) return null;

  const payload = await response.json();
  const page = Object.values(payload?.query?.pages ?? {})[0];
  return page?.thumbnail?.source ?? null;
}

async function urlsFromLinkedData(tags) {
  const urls = [];
  const wikidataIds = [
    tags.wikidata,
    tags['brand:wikidata'],
    tags['operator:wikidata'],
  ].filter(Boolean);

  const lookups = await Promise.all([
    ...wikidataIds.map(qid => wikidataImageUrl(qid)),
    tags.wikipedia ? wikipediaImageUrl(tags.wikipedia) : Promise.resolve(null),
  ]);

  for (const url of lookups) pushUniqueUrl(urls, url);
  return urls;
}

/** Best-effort venue photo for an OSM element referenced by a Photon place id. */
export async function fetchPlaceImageUrl({ osmType, osmId }) {
  try {
    const tags = await fetchOverpassTags(osmType, osmId);
    if (!tags) return null;

    const directUrls = urlsFromOsmTags(tags);
    if (directUrls.length > 0) return directUrls[0];

    const linkedUrls = await urlsFromLinkedData(tags);
    return linkedUrls[0] ?? null;
  } catch {
    return null;
  }
}
