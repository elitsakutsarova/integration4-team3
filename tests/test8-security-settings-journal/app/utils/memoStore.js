import { getSupabaseBrowserClient, isSupabaseEnabled } from './supabase.client';
import { isSafeHttpsUrl, validateCreateMemoInput } from './validators';

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

/** Memos published by the signed-in user. */
export async function fetchCreatedMemosByUser(authUserId) {
  if (!authUserId || !isSupabaseEnabled()) return [];

  const client = getSupabaseBrowserClient();
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
  if (!ids.length || !isSupabaseEnabled()) return [];

  const client = getSupabaseBrowserClient();
  if (!client) return [];

  const { data, error } = await queryMemos(client, columns =>
    client.from('memos').select(columns).in('id', ids),
  );

  if (error || !Array.isArray(data)) return [];
  return data.map(mapMemoRowToPin);
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
  },
  serverContext = null,
) {
  if (!isSupabaseEnabled()) {
    return { error: 'Supabase is not configured.' };
  }

  const client = serverContext?.client ?? getSupabaseBrowserClient();
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
  });
  if (validated.field) return { error: validated.message };

  let media_url = null;
  let media_type = null;

  if (validated.media) {
    const uploadResult = await uploadMemoMedia(client, userId, validated.media);
    if (uploadResult.error) return uploadResult;
    media_url = uploadResult.media_url ?? null;
    media_type = uploadResult.media_type ?? null;
  }

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