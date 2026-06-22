import { ADD_MEMO_RETURN_PARAM } from './appPaths';
import { DEFAULT_MEMO_TAG, MEMO_TAG_OPTIONS } from '../data/memoTags';

const STORAGE_KEY = 'memome:new-memo-draft';
const MEDIA_PERSIST_MAX_BYTES = 3 * 1024 * 1024;

export const MEMO_DRAFT_SEARCH_KEYS = [
  'addMemo',
  'lat',
  'lng',
  'pinLat',
  'pinLng',
  'locationName',
  'placeId',
  ADD_MEMO_RETURN_PARAM,
];

function userKey(userId) {
  return userId ?? 'guest';
}

function readAll() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeAll(data) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [DEFAULT_MEMO_TAG];
  const valid = tags.filter(tag => MEMO_TAG_OPTIONS.includes(tag));
  return valid.length ? valid.slice(0, 1) : [DEFAULT_MEMO_TAG];
}

export function snapshotMemoDraftSearchParams(searchParams) {
  const snapshot = {};
  for (const key of MEMO_DRAFT_SEARCH_KEYS) {
    const value = searchParams.get(key);
    if (value) snapshot[key] = value;
  }
  return snapshot;
}

export function memoDraftSearchParamsToUrl(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return null;

  const hasCoordinates = Boolean(snapshot.lat && snapshot.lng);
  if (!hasCoordinates && snapshot.addMemo !== '1') return null;

  const params = new URLSearchParams();
  for (const key of MEMO_DRAFT_SEARCH_KEYS) {
    const value = snapshot[key];
    if (value) params.set(key, value);
  }
  return params;
}

export function loadNewMemoDraft(userId) {
  const raw = readAll()[userKey(userId)];
  if (!raw || typeof raw !== 'object') return null;

  return {
    quote: String(raw.quote ?? ''),
    selectedTags: normalizeTags(raw.selectedTags),
    quoteTouched: Boolean(raw.quoteTouched),
    searchParams: raw.searchParams && typeof raw.searchParams === 'object'
      ? raw.searchParams
      : {},
    media: raw.media && typeof raw.media === 'object' ? raw.media : null,
  };
}

export function saveNewMemoDraft(userId, draft) {
  if (typeof window === 'undefined' || !userId) return;

  const all = readAll();
  all[userKey(userId)] = {
    quote: String(draft.quote ?? ''),
    selectedTags: normalizeTags(draft.selectedTags),
    quoteTouched: Boolean(draft.quoteTouched),
    searchParams: draft.searchParams ?? {},
    media: draft.media ?? null,
  };
  writeAll(all);
}

export function clearNewMemoDraft(userId) {
  if (typeof window === 'undefined' || !userId) return;

  const all = readAll();
  const key = userKey(userId);
  if (!(key in all)) return;
  delete all[key];
  writeAll(all);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function serializeMediaPreview(mediaPreview) {
  if (!mediaPreview?.file || mediaPreview.file.size > MEDIA_PERSIST_MAX_BYTES) {
    return null;
  }

  try {
    const dataUrl = await fileToDataUrl(mediaPreview.file);
    return {
      dataUrl,
      name: mediaPreview.file.name || 'memo-media',
      mimeType: mediaPreview.file.type || (mediaPreview.isVideo ? 'video/mp4' : 'image/jpeg'),
      isVideo: Boolean(mediaPreview.isVideo),
      width: mediaPreview.width ?? null,
      height: mediaPreview.height ?? null,
    };
  } catch {
    return null;
  }
}

export async function restoreMediaPreview(stored) {
  if (!stored?.dataUrl) return null;

  try {
    const response = await fetch(stored.dataUrl);
    const blob = await response.blob();
    const file = new File([blob], stored.name || 'memo-media', {
      type: stored.mimeType || blob.type,
    });
    const url = URL.createObjectURL(file);
    return {
      url,
      file,
      isVideo: Boolean(stored.isVideo),
      width: stored.width ?? undefined,
      height: stored.height ?? undefined,
    };
  } catch {
    return null;
  }
}
