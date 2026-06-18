// this file is the data layer for memos
// loades memos from Supabase
// creates new memos
// uploades memo photos/videos
// converts database rows into map pins
// fetches a user's own memos or favourites
// UI -> memo service (this file) -> Supabase Database + Storage

import { isSupabaseConfigured } from './supabase.env';
import { isSafeHttpsUrl, validateCreateMemoInput, validateMemoMediaFile, validateUpdateMemoInput } from './validators';

async function getBrowserSupabaseClient() {
  const { getSupabaseBrowserClient } = await import('./supabase.client');
  return getSupabaseBrowserClient();
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MEMO_MEDIA_BUCKET = 'memo-media';
const DEFAULT_LOCATION = 'My spot';

const MEMO_COLUMNS_BASE =
  'id, quote, lat, lng, location, tags, media_url, media_type, created_at';
const MEMO_COLUMNS = `${MEMO_COLUMNS_BASE}, place_id`;

/** Schema-migration shim — retries without place_id until all envs run the migration. */
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

async function insertMemo(client, row) {
  let result = await client.from('memos').insert(row).select(MEMO_COLUMNS).single();
  if (result.error && isMissingPlaceIdColumn(result.error)) {
    const { place_id, ...rest } = row;
    result = await client.from('memos').insert(rest).select(MEMO_COLUMNS_BASE).single();
  }
  return result;
}

async function updateMemoRow(client, memoId, userId, row) {
  let result = await client
    .from('memos')
    .update(row)
    .eq('id', memoId)
    .eq('auth_id', userId)
    .select(MEMO_COLUMNS)
    .maybeSingle();

  if (result.error && isMissingPlaceIdColumn(result.error)) {
    const { place_id, ...rest } = row;
    result = await client
      .from('memos')
      .update(rest)
      .eq('id', memoId)
      .eq('auth_id', userId)
      .select(MEMO_COLUMNS_BASE)
      .maybeSingle();
  }

  return result;
}

function mapMemoUpdateError(error) {
  const message = String(error?.message ?? '');
  if (message.includes('Cannot coerce the result to a single JSON object')) {
    return 'Could not update this memo. Check that you are signed in and own this memo.';
  }
  return message || 'Could not update memo.';
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

function extensionFromFile(file, mediaType) {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  return mediaType === 'video' ? 'mp4' : 'jpg';
}

async function uploadMemoMedia(client, userId, media) {
  const path = `${userId}/${crypto.randomUUID()}.${extensionFromFile(media.file, media.mediaType)}`;
  const { error: uploadError } = await client.storage
    .from(MEMO_MEDIA_BUCKET)
    .upload(path, media.file, { contentType: media.mime, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data } = client.storage.from(MEMO_MEDIA_BUCKET).getPublicUrl(path);
  if (!isSafeHttpsUrl(data.publicUrl)) {
    return { error: 'Invalid media URL returned from storage.' };
  }

  return {
    media_url: data.publicUrl,
    media_type: media.mediaType,
  };
}

/** Upload memo media from the browser (faster than posting the file through the app server). */
export async function uploadMemoMediaForUser(file, userId) {
  if (!userId) return { error: 'auth_required' };

  const validated = validateMemoMediaFile(file);
  if (validated.field) return { error: validated.message };
  if (!validated.value) return { error: 'Media is required.' };

  const client = await getBrowserSupabaseClient();
  if (!client) return { error: 'Could not connect to Supabase.' };

  return uploadMemoMedia(client, userId, validated.value);
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
    createdAt: row.created_at ?? null,
    fromDb: true,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Load all published memos — visible to guests and signed-in users. */
export async function fetchMemos() {
  if (!isSupabaseConfigured()) return [];

  const client = await getBrowserSupabaseClient();
  if (!client) return [];

  const { data, error } = await queryMemos(client, columns =>
    client.from('memos').select(columns).order('created_at', { ascending: false }),
  );

  if (error || !Array.isArray(data)) return [];
  return data.map(mapMemoRowToPin);
}

/** Memos published by the signed-in user. */
export async function fetchCreatedMemosByUser(authUserId) {
  if (!authUserId || !isSupabaseConfigured()) return [];

  const client = await getBrowserSupabaseClient();
  if (!client) return [];

  const { data, error } = await queryMemos(client, columns =>
    client
      .from('memos')
      .select(columns)
      .eq('auth_id', authUserId)
      .order('created_at', { ascending: false }),
  );

  if (error || !Array.isArray(data)) return [];
  return data.map(mapMemoRowToPin);
}

/** Load memo rows by id — used to hydrate heart-saved favourites. */
export async function fetchMemosByIds(memoIds) {
  const ids = [...new Set(memoIds.map(id => String(id)).filter(Boolean))];
  if (!ids.length || !isSupabaseConfigured()) return [];

  const client = await getBrowserSupabaseClient();
  if (!client) return [];

  const { data, error } = await queryMemos(client, columns =>
    client.from('memos').select(columns).in('id', ids),
  );

  if (error || !Array.isArray(data)) return [];
  return data.map(mapMemoRowToPin);
}

/** Load one memo owned by the signed-in user. */
export async function fetchCreatedMemoById(authUserId, memoId, serverContext = null) {
  if (!authUserId || !memoId || !isSupabaseConfigured()) return null;

  const client = serverContext?.client ?? (await getBrowserSupabaseClient());
  if (!client) return null;

  const { data, error } = await queryMemos(client, columns =>
    client
      .from('memos')
      .select(columns)
      .eq('id', memoId)
      .eq('auth_id', authUserId)
      .maybeSingle(),
  );

  if (error || !data) return null;
  return mapMemoRowToPin(data);
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Persist a new memo for the signed-in user. */
export async function createMemo(
  {
    quote,
    lat,
    lng,
    tags,
    location = DEFAULT_LOCATION,
    placeId = null,
    media = null,
    mediaUrl = null,
    mediaType = null,
  },
  serverContext = null,
) {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase is not configured.' };
  }

  const client = serverContext?.client ?? (await getBrowserSupabaseClient());
  if (!client) return { error: 'Could not connect to Supabase.' };

  let userId = serverContext?.userId ?? null;
  if (!userId) {
    const { data: authData, error: authError } = await client.auth.getSession();
    if (authError || !authData?.session?.user?.id) {
      return { error: 'auth_required' };
    }
    userId = authData.session.user.id;
  }

  const validated = validateCreateMemoInput({
    quote,
    lat,
    lng,
    tags,
    location,
    placeId,
    media,
    mediaUrl,
    mediaType,
    userId,
  });
  if (validated.field) return { error: validated.message };

  let media_url = null;
  let media_type = null;

  if (validated.uploadedMedia) {
    media_url = validated.uploadedMedia.media_url;
    media_type = validated.uploadedMedia.media_type;
  } else if (validated.media) {
    const uploadResult = await uploadMemoMedia(client, userId, validated.media);
    if (uploadResult.error) return uploadResult;
    media_url = uploadResult.media_url ?? null;
    media_type = uploadResult.media_type ?? null;
  }

  // Dynamic import avoids circular dependency: memoQueries imports mapMemoRowToPin from here.
  const { countMemosAtSpot, MAX_MEMOS_PER_SPOT } = await import('./memoQueries');
  const spotCount = await countMemosAtSpot(client, {
    placeId: validated.placeId,
    lat: validated.lat,
    lng: validated.lng,
    locationName: validated.location,
  });

  if (spotCount >= MAX_MEMOS_PER_SPOT) {
    return { error: `This spot already has ${MAX_MEMOS_PER_SPOT} memos.` };
  }

  const row = {
    auth_id: userId,
    quote: validated.quote,
    lat: validated.lat,
    lng: validated.lng,
    location: validated.location,
    tags: validated.tags,
    media_url,
    media_type,
  };

  if (validated.placeId) row.place_id = validated.placeId;

  const { data, error } = await insertMemo(client, row);

  if (error) return { error: error.message };
  return { memo: mapMemoRowToPin(data) };
}

/** Update an existing memo for the signed-in user. */
export async function updateMemo(
  {
    memoId,
    quote,
    lat,
    lng,
    tags,
    location = DEFAULT_LOCATION,
    placeId = null,
    media = null,
    removeMedia = false,
  },
  serverContext = null,
) {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase is not configured.' };
  }

  const client = serverContext?.client ?? (await getBrowserSupabaseClient());
  if (!client) return { error: 'Could not connect to Supabase.' };

  let userId = serverContext?.userId ?? null;
  if (!userId) {
    const { data: authData, error: authError } = await client.auth.getSession();
    if (authError || !authData?.session?.user?.id) {
      return { error: 'auth_required' };
    }
    userId = authData.session.user.id;
  }

  const validated = validateUpdateMemoInput({
    memoId,
    quote,
    lat,
    lng,
    tags,
    location,
    placeId,
    media,
    removeMedia,
  });
  if (validated.field) return { error: validated.message };

  const existing = await fetchCreatedMemoById(userId, validated.memoId, serverContext);
  if (!existing) return { error: 'Memo not found.' };

  const { countMemosAtSpot, MAX_MEMOS_PER_SPOT } = await import('./memoQueries');
  const spotCount = await countMemosAtSpot(
    client,
    {
      placeId: validated.placeId,
      lat: validated.lat,
      lng: validated.lng,
      locationName: validated.location,
    },
    { excludeMemoId: validated.memoId },
  );

  if (spotCount >= MAX_MEMOS_PER_SPOT) {
    return { error: `This spot already has ${MAX_MEMOS_PER_SPOT} memos.` };
  }

  let media_url = existing.mediaPreview?.url ?? null;
  let media_type = existing.mediaPreview?.isVideo ? 'video' : existing.mediaPreview ? 'image' : null;

  if (validated.mediaPatch.action === 'remove') {
    media_url = null;
    media_type = null;
  } else if (validated.mediaPatch.action === 'replace') {
    const uploadResult = await uploadMemoMedia(client, userId, validated.mediaPatch.media);
    if (uploadResult.error) return uploadResult;
    media_url = uploadResult.media_url ?? null;
    media_type = uploadResult.media_type ?? null;
  }

  const row = {
    quote: validated.quote,
    lat: validated.lat,
    lng: validated.lng,
    location: validated.location,
    tags: validated.tags,
    media_url,
    media_type,
  };

  if (validated.placeId) row.place_id = validated.placeId;
  else row.place_id = null;

  const result = await updateMemoRow(client, validated.memoId, userId, row);

  if (result.error) return { error: mapMemoUpdateError(result.error) };
  if (!result.data) return { error: 'Memo not found or you do not have permission to edit it.' };

  return { memo: mapMemoRowToPin(result.data) };
}