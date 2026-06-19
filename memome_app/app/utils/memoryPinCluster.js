// distance + grouping for dense memory-pin clusters on the map

export const CLUSTER_RADIUS_M = 800;
export const CLUSTER_MIN_COUNT = 31;
export const CLUSTER_MAX_ZOOM = 15;

export const SAME_SPOT_COORD_PRECISION = 5;
export const SAME_SPOT_RADIUS_M = 50;
export const SPOT_PIN_SPACING_M = 1.2;
export const SPOT_CLUSTER_MAX_ZOOM = 16;

const GENERIC_LOCATION = 'my spot';

const EARTH_RADIUS_M = 6_371_000;

export function normalizePinLl(pin) {
  if (!pin) return null;

  if (Array.isArray(pin.ll) && pin.ll.length >= 2) {
    const lat = Number(pin.ll[0]);
    const lng = Number(pin.ll[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
  }

  const lat = Number(pin.lat);
  const lng = Number(pin.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];

  return null;
}

export function haversineMeters(a, b) {
  const [lat1, lng1] = a;
  const [lat2, lng2] = b;
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const x =
    Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(x));
}

function neighborsWithin(index, pins, radiusM) {
  const result = [];
  for (let j = 0; j < pins.length; j += 1) {
    if (haversineMeters(pins[index].ll, pins[j].ll) <= radiusM) result.push(j);
  }
  return result;
}

export function partitionMemoryPins(pins) {
  const valid = pins
    .map(pin => {
      const ll = normalizePinLl(pin);
      return ll ? { ...pin, ll } : null;
    })
    .filter(Boolean);
  const n = valid.length;
  if (n === 0) return { denseGroups: [], standalonePins: [] };

  const neighborCache = valid.map((_, i) => neighborsWithin(i, valid, CLUSTER_RADIUS_M));
  const labels = new Array(n).fill(undefined);
  let clusterId = 0;

  for (let i = 0; i < n; i += 1) {
    if (labels[i] !== undefined) continue;
    if (neighborCache[i].length < CLUSTER_MIN_COUNT) {
      labels[i] = -1;
      continue;
    }

    labels[i] = clusterId;
    const queue = [...neighborCache[i]];
    const seen = new Set([i]);

    while (queue.length > 0) {
      const q = queue.shift();
      if (labels[q] === -1) labels[q] = clusterId;
      if (labels[q] !== undefined && labels[q] !== clusterId) continue;
      labels[q] = clusterId;

      if (neighborCache[q].length >= CLUSTER_MIN_COUNT) {
        for (const nb of neighborCache[q]) {
          if (!seen.has(nb)) {
            seen.add(nb);
            queue.push(nb);
          }
        }
      }
    }

    clusterId += 1;
  }

  const buckets = new Map();
  const standalonePins = [];

  for (let i = 0; i < n; i += 1) {
    const label = labels[i];
    if (label === -1 || label === undefined) {
      standalonePins.push(valid[i]);
      continue;
    }
    if (!buckets.has(label)) buckets.set(label, []);
    buckets.get(label).push(valid[i]);
  }

  const denseGroups = [...buckets.values()].filter(g => g.length >= CLUSTER_MIN_COUNT);

  for (const group of buckets.values()) {
    if (group.length < CLUSTER_MIN_COUNT) standalonePins.push(...group);
  }

  return { denseGroups, standalonePins };
}

export function clusterCentroid(pins) {
  const sum = pins.reduce(
    (acc, p) => {
      acc[0] += p.ll[0];
      acc[1] += p.ll[1];
      return acc;
    },
    [0, 0],
  );
  return [sum[0] / pins.length, sum[1] / pins.length];
}

export function shouldShowClusters(zoom) {
  return zoom <= CLUSTER_MAX_ZOOM;
}

function normalizeLocationName(name) {
  const label = String(name ?? '').trim().toLowerCase();
  return label && label !== GENERIC_LOCATION ? label : '';
}

function coordBucketKey(pin) {
  const [lat, lng] = pin.ll;
  return `${lat.toFixed(SAME_SPOT_COORD_PRECISION)},${lng.toFixed(SAME_SPOT_COORD_PRECISION)}`;
}

function createUnionFind(size) {
  const parent = Array.from({ length: size }, (_, i) => i);
  const find = i => {
    if (parent[i] !== i) parent[i] = find(parent[i]);
    return parent[i];
  };
  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootB] = rootA;
  };
  return { find, union };
}

function unionBySharedKey(uf, index, key, keyToIndex) {
  if (keyToIndex.has(key)) uf.union(index, keyToIndex.get(key));
  else keyToIndex.set(key, index);
}

function unionByLocationAndProximity(uf, pins) {
  const count = pins.length;
  for (let i = 0; i < count; i += 1) {
    const location = normalizeLocationName(pins[i].location);
    if (!location) continue;

    for (let j = i + 1; j < count; j += 1) {
      if (location !== normalizeLocationName(pins[j].location)) continue;
      if (haversineMeters(pins[i].ll, pins[j].ll) <= SAME_SPOT_RADIUS_M) {
        uf.union(i, j);
      }
    }
  }
}

/** Group pins at the same venue — matches memo spot limits (place_id, coords, location). */
export function groupPinsBySpot(pins) {
  const valid = pins
    .map(pin => {
      const ll = normalizePinLl(pin);
      return ll ? { ...pin, ll } : null;
    })
    .filter(Boolean);
  const count = valid.length;
  if (count === 0) return new Map();

  const uf = createUnionFind(count);
  const placeIndex = new Map();
  const coordIndex = new Map();

  for (let i = 0; i < count; i += 1) {
    const pin = valid[i];
    if (pin.placeId) unionBySharedKey(uf, i, pin.placeId, placeIndex);
    unionBySharedKey(uf, i, coordBucketKey(pin), coordIndex);
  }

  unionByLocationAndProximity(uf, valid);

  const groups = new Map();
  for (let i = 0; i < count; i += 1) {
    const root = uf.find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(valid[i]);
  }

  return groups;
}

export function shouldShowSpotClusters(zoom) {
  return zoom <= SPOT_CLUSTER_MAX_ZOOM;
}

function offsetMeters(lat, lng, eastM, northM) {
  const dLat = northM / 111_111;
  const dLng = eastM / (111_111 * Math.cos((lat * Math.PI) / 180));
  return [lat + dLat, lng + dLng];
}

/** Spread co-located pins ~1m apart so they remain clickable when zoomed in. */
export function spreadPinPosition(center, index, total) {
  const [lat, lng] = center;
  if (total <= 1) return center;

  const spacingM = SPOT_PIN_SPACING_M;

  if (total <= 12) {
    const angle = (2 * Math.PI * index) / total;
    return offsetMeters(lat, lng, spacingM * Math.cos(angle), spacingM * Math.sin(angle));
  }

  const angle = index * 2.399963;
  const radiusM = spacingM * (1 + Math.sqrt(index) * 0.85);
  return offsetMeters(lat, lng, radiusM * Math.cos(angle), radiusM * Math.sin(angle));
}
