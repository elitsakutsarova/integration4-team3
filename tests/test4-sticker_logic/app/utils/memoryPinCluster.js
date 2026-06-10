/** Distance + grouping for dense memory-pin clusters on the map. */

/** Pins closer than this (metres) belong to the same cluster candidate group. */
export const CLUSTER_RADIUS_M = 800;

/** Only groups with at least this many pins use zoom-based clustering. */
export const CLUSTER_MIN_COUNT = 31;

/** At this zoom and below, dense groups render as one cluster pin. */
export const CLUSTER_MAX_ZOOM = 14;

const EARTH_RADIUS_M = 6_371_000;

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

/**
 * DBSCAN-style grouping: only forms clusters where 31+ pins lie within
 * CLUSTER_RADIUS_M of each other (no long chain links across the city).
 * @param {Array<{ ll: [number, number] }>} pins
 */
export function partitionMemoryPins(pins) {
  const valid = pins.filter(
    p => Array.isArray(p.ll) && p.ll.every(n => typeof n === 'number' && Number.isFinite(n)),
  );
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
