/** In-memory snapshots of root session collections for route clientLoaders. */

let savedMemosSnapshot = [];
let discoverFavesSnapshot = [];
let createdMemosSnapshot = [];

export function setSavedMemosSnapshot(entries) {
  savedMemosSnapshot = entries;
}

export function getSavedMemosSnapshot() {
  return savedMemosSnapshot;
}

export function setDiscoverFavesSnapshot(entries) {
  discoverFavesSnapshot = entries;
}

export function getDiscoverFavesSnapshot() {
  return discoverFavesSnapshot;
}

export function setCreatedMemosSnapshot(memos) {
  createdMemosSnapshot = memos;
}

export function getCreatedMemosSnapshot() {
  return createdMemosSnapshot;
}
