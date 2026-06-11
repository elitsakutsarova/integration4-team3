import { MEMO_TAG_OPTIONS } from '../data/memoTags';
import { isPhotonPlaceId } from './placeId';
import { getSupabaseBrowserClient, isSupabaseEnabled } from './supabase.client';

// ─── Constants ────────────────────────────────────────────────────────────────

export const MEMO_MAX_MEDIA_BYTES = 10 * 1024 * 1024;

const MEMO_MEDIA_BUCKET = 'memo-media';
const DEFAULT_LOCATION = 'My spot';

const MEMO_COLUMNS_BASE =
  'id, quote, lat, lng, location, tags, media_url, media_type, created_at';
const MEMO_COLUMNS = `${MEMO_COLUMNS_BASE}, place_id`;

function isMissingPlaceIdColumn(error) {
  const msg = String(error?.message ?? error?.details ?? '').toLowerCase();
  return msg.includes('place_id');
}

async function queryMemos(client, buildQuery) {
  let result = await buildQuery(MEMO_COLUMNS);
  if (result.error && isMissingPlaceIdColumn(result.error)) {
    result = await buildQuery(MEMO_COLUMNS_BASE);
  }
  return result;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMemoDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Coerces any value to an array, filtering out nullish singletons. */
function toArray(v) {
  if (Array.isArray(v)) return v;
  return v != null ? [v] : [];
}

function normalizeTags(rawTags) {
  const allowed = new Set(MEMO_TAG_OPTIONS);
  return [...new Set(toArray(rawTags).filter(tag => allowed.has(tag)))];
}

function mediaTypeFromFile(file) {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('image/')) return 'image';
  return null;
}

function extensionFromFile(file, mediaType) {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  return mediaType === 'video' ? 'mp4' : 'jpg';
}

function validateMemoMedia(file) {
  if (!(file instanceof File) || file.size <= 0) return null;

  if (file.size > MEMO_MAX_MEDIA_BYTES) {
    return { error: 'Media must be under 10 MB.' };
  }

  const mediaType = mediaTypeFromFile(file);
  if (!mediaType) {
    return { error: 'Only images and videos are allowed.' };
  }

  return { mediaType };
}

async function uploadMemoMedia(client, userId, file) {
  const validation = validateMemoMedia(file);
  if (!validation) return {};
  if (validation.error) return validation;

  const path = `${userId}/${crypto.randomUUID()}.${extensionFromFile(file, validation.mediaType)}`;
  const { error: uploadError } = await client.storage
    .from(MEMO_MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data } = client.storage.from(MEMO_MEDIA_BUCKET).getPublicUrl(path);
  return {
    media_url: data.publicUrl,
    media_type: validation.mediaType,
  };
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

export function mapMemoRowToPin(row) {
  return {
    id: row.id,
    ll: [row.lat, row.lng],
    quote: row.quote,
    location: row.location ?? DEFAULT_LOCATION,
    placeId: row.place_id ?? null,
    tags: toArray(row.tags),
    date: formatMemoDate(row.created_at),
    mediaPreview: row.media_url
      ? { url: row.media_url, isVideo: row.media_type === 'video' }
      : null,
    fromDb: true,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Load all published memos — visible to guests and signed-in users. */
export async function fetchMemos() {
  if (!isSupabaseEnabled()) return [];

  const client = getSupabaseBrowserClient();
  if (!client) return [];

  const { data, error } = await queryMemos(client, columns =>
    client.from('memos').select(columns).order('created_at', { ascending: false }),
  );

  if (error || !Array.isArray(data)) return [];
  return data.map(mapMemoRowToPin);
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Persist a new memo for the signed-in user. */
export async function createMemo({
  quote,
  lat,
  lng,
  tags,
  location = DEFAULT_LOCATION,
  placeId = null,
  media = null,
}) {
  if (!isSupabaseEnabled()) {
    return { error: 'Supabase is not configured.' };
  }

  const client = getSupabaseBrowserClient();
  if (!client) return { error: 'Could not connect to Supabase.' };

  const { data: authData, error: authError } = await client.auth.getSession();
  if (authError || !authData?.session?.user?.id) {
    return { error: 'auth_required' };
  }
  const userId = authData.session.user.id;

  const trimmedQuote = String(quote ?? '').trim();
  if (!trimmedQuote) return { error: 'Quote is required.' };

  const normalizedTags = normalizeTags(tags);
  if (normalizedTags.length === 0) {
    return { error: 'Pick at least one tag.' };
  }

  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { error: 'Invalid map location.' };
  }

  let media_url = null;
  let media_type = null;

  if (media instanceof File && media.size > 0) {
    const uploadResult = await uploadMemoMedia(client, userId, media);
    if (uploadResult.error) return uploadResult;
    media_url = uploadResult.media_url ?? null;
    media_type = uploadResult.media_type ?? null;
  }

  const normalizedPlaceId = isPhotonPlaceId(placeId) ? placeId : null;
  const locationLabel = String(location).trim() || DEFAULT_LOCATION;

  const { countMemosAtSpot, MAX_MEMOS_PER_SPOT } = await import('./memoQueries');
  const spotCount = await countMemosAtSpot(client, {
    placeId: normalizedPlaceId,
    lat: latitude,
    lng: longitude,
    locationName: locationLabel,
  });

  if (spotCount >= MAX_MEMOS_PER_SPOT) {
    return { error: `This spot already has ${MAX_MEMOS_PER_SPOT} memos.` };
  }

  const row = {
    auth_id: userId,
    quote: trimmedQuote,
    lat: latitude,
    lng: longitude,
    location: locationLabel,
    tags: normalizedTags,
    media_url,
    media_type,
  };

  if (normalizedPlaceId) row.place_id = normalizedPlaceId;

  let { data, error } = await client
    .from('memos')
    .insert(row)
    .select(MEMO_COLUMNS)
    .single();

  if (error && isMissingPlaceIdColumn(error)) {
    delete row.place_id;
    ({ data, error } = await client
      .from('memos')
      .insert(row)
      .select(MEMO_COLUMNS_BASE)
      .single());
  }

  if (error) return { error: error.message };
  return { memo: mapMemoRowToPin(data) };
}