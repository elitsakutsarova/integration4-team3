// utility function that checks if a memo is near a discover event on the map

import { getAllDiscoverEvents, getDiscoverEventById } from '../data/discoverDetails';
import { haversineMeters } from './memoryPinCluster';

const EVENT_VICINITY_RADIUS_M = 300;

function normalizeCoords(ll) {
  if (!Array.isArray(ll) || ll.length < 2) return null;
  const lat = Number(ll[0]);
  const lng = Number(ll[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

function getDiscoverEventsWithCoords() {
  return getAllDiscoverEvents()
    .map(event => getDiscoverEventById(event.id))
    .filter(event => normalizeCoords(event?.ll));
}

function matchesEventPlaceId(memo, events) {
  const placeId = memo?.placeId?.trim();
  if (!placeId) return false;
  return events.some(event => event.placeId === placeId);
}

export function isMemoNearDiscoverEvent(memo) {
  const events = getDiscoverEventsWithCoords();
  if (!events.length) return false;

  if (matchesEventPlaceId(memo, events)) return true;

  const memoCoords = normalizeCoords(memo?.ll);
  if (!memoCoords) return false;

  return events.some(
    event => haversineMeters(memoCoords, event.ll) <= EVENT_VICINITY_RADIUS_M,
  );
}

export function hasMemoNearDiscoverEvent(memos = []) {
  return memos.some(isMemoNearDiscoverEvent);
}
