// pure field-level validation (format, length, required) -> no user context or network, re-usable

import { MEMO_TAG_OPTIONS } from '../data/memoTags';
import { containsProfanity, PROFANITY_ERROR_MESSAGE } from './profanityFilter';
import { isInAntwerpBounds } from './locationHelpers';
import { isPhotonPlaceId } from './placeId';
import { getPasswordChecks } from './passwordRules';
import { getSupabaseUrl } from './supabase.env';

export const LIMITS = {
  memoQuote: 100,
  memoLocation: 120,
  username: 30,
  email: 254,
  password: 128,
  searchQuery: 100,
  scanKey: 64,
  connectRoom: 64,
  connectMessage: 500,
  feedbackName: 120,
  feedbackSubject: 200,
  feedbackMessage: 2000,
  savedMemoId: 64,
  discoverFaveId: 80,
  urlDisplayName: 120,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-z0-9_]+$/;
const USER_ROLES = new Set(['visitor', 'local']);
const MEMO_TAG_SET = new Set(MEMO_TAG_OPTIONS);
const DISCOVER_FAVE_TYPES = new Set(['event', 'place']);
const CONNECT_ROOM_RE = /^[A-Z0-9_-]+$/;
const SCAN_KEY_RE = /^[a-zA-Z0-9._-]+$/;
const SAVED_MEMO_ID_RE = /^[0-9a-f-]{36}$/i;
const DISCOVER_FAVE_ID_RE = /^[a-zA-Z0-9._-]+$/;
const CONTROL_CHARS_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export const ALLOWED_MEDIA_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

export function validationError(field, message) {
  return { field, message };
}

export function stripControlChars(value) {
  return String(value ?? '').replace(CONTROL_CHARS_RE, '');
}

/** Strip @ prefix and lowercase for username comparison. */
export function normalizeUsername(raw) {
  return stripControlChars(raw).trim().replace(/^@+/, '').toLowerCase();
}

/** Trim and lowercase for email comparison. */
export function normalizeEmail(raw) {
  return stripControlChars(raw).trim().toLowerCase();
}

export function clampText(value, maxLength) {
  const clean = stripControlChars(value).trim();
  if (!clean) return '';
  return clean.length <= maxLength ? clean : clean.slice(0, maxLength);
}

export function validateEmail(raw) {
  const email = clampText(String(raw ?? '').toLowerCase(), LIMITS.email);
  if (!email) return validationError('email', 'Enter a valid email address');
  if (!EMAIL_RE.test(email)) return validationError('email', 'Enter a valid email address');
  return { value: email };
}

export function validatePassword(raw) {
  const password = String(raw ?? '');
  if (!password) return validationError('password', 'Password is required');
  if (password.length > LIMITS.password) {
    return validationError('password', `Password must be under ${LIMITS.password} characters`);
  }
  const checks = getPasswordChecks(password);
  if (!checks.isValid) {
    return validationError('password', 'Use at least 8 characters with upper and lower case');
  }
  return { value: password };
}

export function validateUsername(raw) {
  const clean = normalizeUsername(raw);
  if (!clean) return validationError('username', 'Username is required');
  if (clean.length > LIMITS.username) {
    return validationError('username', `Username must be under ${LIMITS.username} characters`);
  }
  if (!USERNAME_RE.test(clean)) {
    return validationError('username', 'Username may only use letters, numbers, and underscores');
  }
  return { value: `@${clean}` };
}

export function validateUserRole(raw) {
  const role = stripControlChars(raw).trim().toLowerCase();
  if (!role) return validationError('role', 'Please select if you are a Visitor or a Local to continue');
  if (!USER_ROLES.has(role)) {
    return validationError('role', 'Please select if you are a Visitor or a Local to continue');
  }
  return { value: role };
}

export function validateSignUpPayload({ username, email, password, role }) {
  const usernameResult = validateUsername(username);
  if (usernameResult.field) return usernameResult;

  const emailResult = validateEmail(email);
  if (emailResult.field) return emailResult;

  const passwordResult = validatePassword(password);
  if (passwordResult.field) return passwordResult;

  const roleResult = validateUserRole(role);
  if (roleResult.field) return roleResult;

  return {
    username: usernameResult.value,
    email: emailResult.value,
    password: passwordResult.value,
    role: roleResult.value,
  };
}

export function validateChangePasswordPayload({ oldPassword, newPassword, confirmPassword }) {
  const old = String(oldPassword ?? '');
  if (!old) return validationError('oldPassword', 'Enter your current password');
  if (old.length > LIMITS.password) {
    return validationError('oldPassword', `Password must be under ${LIMITS.password} characters`);
  }

  const newResult = validatePassword(newPassword);
  if (newResult.field) {
    return validationError(
      'newPassword',
      'Password must be at least 8 characters and include an uppercase, lowercase and number',
    );
  }

  const confirm = String(confirmPassword ?? '');
  if (!confirm) return validationError('confirmPassword', 'Confirm your new password');
  if (confirm !== newResult.value) {
    return validationError('confirmPassword', 'Passwords do not match');
  }
  if (old === newResult.value) {
    return validationError('newPassword', 'Choose a different password than your current one');
  }

  return { oldPassword: old, newPassword: newResult.value };
}

export const NEW_PASSWORD_SAME_AS_OLD_MESSAGE = "New password can't be the same as the old one";

export function validateResetPasswordPayload({ newPassword, confirmPassword }) {
  const newResult = validatePassword(newPassword);
  if (newResult.field) {
    return validationError(
      'newPassword',
      'Password must be at least 8 characters and include an uppercase, lowercase and number',
    );
  }

  const confirm = String(confirmPassword ?? '');
  if (!confirm) return validationError('confirmPassword', 'Confirm your new password');
  if (confirm !== newResult.value) {
    return validationError('confirmPassword', 'Passwords do not match');
  }

  return { newPassword: newResult.value };
}

export function validateChangeEmailPayload({ oldEmail, newEmail, password }) {
  const oldResult = validateEmail(oldEmail);
  if (oldResult.field) return validationError('oldEmail', 'Enter your current email address');

  const newResult = validateEmail(newEmail);
  if (newResult.field) return validationError('newEmail', 'Enter a valid email address');

  if (oldResult.value === newResult.value) {
    return validationError('newEmail', 'Choose a different email than your current one');
  }

  const passwordValue = String(password ?? '');
  if (!passwordValue) return validationError('password', 'Password is required');
  if (passwordValue.length > LIMITS.password) {
    return validationError('password', `Password must be under ${LIMITS.password} characters`);
  }

  return {
    oldEmail: oldResult.value,
    newEmail: newResult.value,
    password: passwordValue,
  };
}

export function validateChangeUsernamePayload({ username }) {
  return validateUsername(username);
}

export function validateLoginIdentifier(raw) {
  const trimmed = stripControlChars(raw).trim();
  if (!trimmed) return validationError('email', 'Enter your username or email');

  if (trimmed.includes('@')) {
    const emailResult = validateEmail(trimmed);
    if (emailResult.field) return emailResult;
    return { kind: 'email', value: emailResult.value };
  }

  const usernameResult = validateUsername(trimmed);
  if (usernameResult.field) {
    return validationError('email', usernameResult.message);
  }

  return { kind: 'username', value: usernameResult.value };
}

export function validateSignInPayload({ email, password: rawPassword }) {
  const identifierResult = validateLoginIdentifier(email);
  if (identifierResult.field) return identifierResult;

  const password = String(rawPassword ?? '');
  if (!password) return validationError('password', 'Password is required');
  if (password.length > LIMITS.password) {
    return validationError('password', `Password must be under ${LIMITS.password} characters`);
  }

  return {
    identifier: identifierResult.value,
    identifierKind: identifierResult.kind,
    email: trimmedLoginIdentifier(email),
    password,
  };
}

function trimmedLoginIdentifier(raw) {
  return stripControlChars(raw).trim();
}

export function validateMemoQuote(raw) {
  const quote = clampText(raw, LIMITS.memoQuote);
  if (!quote) return validationError('quote', 'Quote is required');
  if (containsProfanity(quote)) {
    return validationError('quote', PROFANITY_ERROR_MESSAGE);
  }
  return { value: quote };
}

export function validateMemoLocation(raw) {
  const location = clampText(raw, LIMITS.memoLocation);
  if (!location) return validationError('location', 'Choose a location for your memo');
  return { value: location };
}

export function validateMemoCoords(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return validationError('location', 'Invalid map location');
  }
  if (!isInAntwerpBounds(latitude, longitude)) {
    return validationError('location', 'Memos must be placed within Antwerp');
  }
  return { lat: latitude, lng: longitude };
}

export function validateMemoTags(rawTags, { max = Infinity } = {}) {
  const tags = [...new Set(
    (Array.isArray(rawTags) ? rawTags : [rawTags])
      .map(tag => stripControlChars(tag).trim())
      .filter(tag => MEMO_TAG_SET.has(tag)),
  )];
  if (!tags.length) return validationError('tags', 'Pick at least one tag');
  if (tags.length > max) return validationError('tags', 'Pick only one tag');
  return { value: tags };
}

export function validateMemoPlaceId(raw) {
  if (raw == null || raw === '') return { value: null };
  const placeId = stripControlChars(raw).trim();
  if (!placeId) return { value: null };
  if (!isPhotonPlaceId(placeId)) return validationError('placeId', 'Invalid place reference');
  return { value: placeId };
}

export function validateMemoMediaFile(file) {
  if (!(file instanceof File) || file.size <= 0) return { value: null };

  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) return validationError('media', 'Media must be under 10 MB');

  const mime = String(file.type ?? '').toLowerCase();
  if (!ALLOWED_MEDIA_MIME_TYPES.has(mime)) {
    return validationError('media', 'Only images and videos are allowed');
  }

  const mediaType = mime.startsWith('video/') ? 'video' : 'image';
  return { value: { file, mediaType, mime } };
}

export function validateMemoUploadedMedia({ mediaUrl, mediaType, userId }) {
  if (!mediaUrl) return { value: null };

  const url = stripControlChars(mediaUrl).trim();
  if (!url || !userId) return validationError('media', 'Invalid media');

  if (!isSafeHttpsUrl(url)) return validationError('media', 'Invalid media URL');

  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) return validationError('media', 'Invalid media URL');

  try {
    const parsed = new URL(url);
    const expectedHost = new URL(supabaseUrl).host;
    if (parsed.host !== expectedHost) return validationError('media', 'Invalid media URL');

    const prefix = `/storage/v1/object/public/memo-media/${userId}/`;
    if (!parsed.pathname.startsWith(prefix)) return validationError('media', 'Invalid media URL');
  } catch {
    return validationError('media', 'Invalid media URL');
  }

  const type = mediaType === 'video' ? 'video' : 'image';
  return { value: { media_url: url, media_type: type } };
}

export function validateCreateMemoInput(input) {
  const quoteResult = validateMemoQuote(input.quote);
  if (quoteResult.field) return quoteResult;

  const coordsResult = validateMemoCoords(input.lat, input.lng);
  if (coordsResult.field) return coordsResult;

  const tagsResult = validateMemoTags(input.tags, { max: 1 });
  if (tagsResult.field) return tagsResult;

  const locationResult = validateMemoLocation(input.location);
  const placeIdResult = validateMemoPlaceId(input.placeId);
  if (placeIdResult.field) return placeIdResult;

  const media = input.media instanceof File && input.media.size > 0
    ? validateMemoMediaFile(input.media)
    : validateMemoUploadedMedia({
      mediaUrl: input.mediaUrl,
      mediaType: input.mediaType,
      userId: input.userId,
    });
  if (media.field) return media;

  const uploadedMedia = media.value?.media_url ? media.value : null;
  const fileMedia = media.value?.file ? media.value : null;

  return {
    quote: quoteResult.value,
    lat: coordsResult.lat,
    lng: coordsResult.lng,
    location: locationResult.value,
    placeId: placeIdResult.value,
    tags: tagsResult.value,
    media: fileMedia,
    uploadedMedia,
  };
}

export function validateMemoId(raw) {
  const id = stripControlChars(raw).trim();
  if (!id) return validationError('memoId', 'Memo not found');
  if (!SAVED_MEMO_ID_RE.test(id)) return validationError('memoId', 'Invalid memo');
  return { value: id };
}

function parseRemoveMediaFlag(raw) {
  return raw === true || raw === 'true' || raw === '1';
}

export function validateUpdateMemoInput(input) {
  const memoIdResult = validateMemoId(input.memoId);
  if (memoIdResult.field) return memoIdResult;

  const quoteResult = validateMemoQuote(input.quote);
  if (quoteResult.field) return quoteResult;

  const coordsResult = validateMemoCoords(input.lat, input.lng);
  if (coordsResult.field) return coordsResult;

  const tagsResult = validateMemoTags(input.tags);
  if (tagsResult.field) return tagsResult;

  const locationResult = validateMemoLocation(input.location);
  if (locationResult.field) return locationResult;

  const placeIdResult = validateMemoPlaceId(input.placeId);
  if (placeIdResult.field) return placeIdResult;

  const removeMedia = parseRemoveMediaFlag(input.removeMedia);
  const hasNewFile = input.media instanceof File && input.media.size > 0;

  let mediaPatch = { action: 'keep' };

  if (hasNewFile) {
    const mediaResult = validateMemoMediaFile(input.media);
    if (mediaResult.field) return mediaResult;
    mediaPatch = { action: 'replace', media: mediaResult.value };
  } else if (removeMedia) {
    mediaPatch = { action: 'remove' };
  }

  return {
    memoId: memoIdResult.value,
    quote: quoteResult.value,
    lat: coordsResult.lat,
    lng: coordsResult.lng,
    location: locationResult.value,
    placeId: placeIdResult.value,
    tags: tagsResult.value,
    mediaPatch,
  };
}

export function validateSearchQuery(raw) {
  const query = clampText(raw, LIMITS.searchQuery).toLowerCase();
  if (query.length < 2) return { value: '' };
  return { value: query };
}

export function validateScanKey(raw) {
  const scan = clampText(raw ?? 'default', LIMITS.scanKey) || 'default';
  if (!SCAN_KEY_RE.test(scan)) return { value: 'default' };
  return { value: scan };
}

export function validateConnectRoom(raw) {
  const room = stripControlChars(raw).trim().toUpperCase().slice(0, LIMITS.connectRoom);
  if (!room) return validationError('room', 'Room code is required');
  if (!CONNECT_ROOM_RE.test(room)) {
    return validationError('room', 'Room code may only use letters, numbers, dashes, and underscores');
  }
  return { value: room };
}

export function validateConnectMessage(raw) {
  const text = clampText(raw, LIMITS.connectMessage);
  if (!text) return validationError('message', 'Message cannot be empty');
  return { value: text };
}

export function validateUrlDisplayName(raw) {
  return clampText(raw, LIMITS.urlDisplayName);
}

export function validateSavedMemoId(raw) {
  const id = stripControlChars(raw).trim();
  if (!id || id.length > LIMITS.savedMemoId) {
    return validationError('memoId', 'Invalid memo reference');
  }
  if (!SAVED_MEMO_ID_RE.test(id)) return validationError('memoId', 'Invalid memo reference');
  return { value: id };
}

export function validateDiscoverFaveType(raw) {
  const type = stripControlChars(raw).trim().toLowerCase();
  if (!DISCOVER_FAVE_TYPES.has(type)) return validationError('type', 'Invalid favourite type');
  return { value: type };
}

export function validateDiscoverFaveId(raw) {
  const id = stripControlChars(raw).trim();
  if (!id || id.length > LIMITS.discoverFaveId) {
    return validationError('id', 'Invalid favourite reference');
  }
  if (isPhotonPlaceId(id) || DISCOVER_FAVE_ID_RE.test(id)) {
    return { value: id };
  }
  return validationError('id', 'Invalid favourite reference');
}

export function validateFeedbackPayload({ name, email, subject, message }) {
  const cleanName = clampText(name, LIMITS.feedbackName);
  if (!cleanName) return validationError('name', 'Name is required');

  const emailResult = validateEmail(email);
  if (emailResult.field) return emailResult;

  const cleanSubject = clampText(subject, LIMITS.feedbackSubject);
  if (!cleanSubject) return validationError('subject', 'Subject is required');

  const cleanMessage = clampText(message, LIMITS.feedbackMessage);
  if (!cleanMessage) return validationError('message', 'Message is required');

  return {
    name: cleanName,
    email: emailResult.value,
    subject: cleanSubject,
    message: cleanMessage,
  };
}

export function isSafeHttpsUrl(url) {
  if (typeof url !== 'string' || !url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isSafeRelativeAssetPath(url) {
  if (typeof url !== 'string' || !url.startsWith('/')) return false;
  if (url.startsWith('//') || url.includes('..')) return false;
  return !/[\s"'<>]/.test(url);
}

export function isSafeMediaAssetUrl(url) {
  return isSafeHttpsUrl(url) || isSafeRelativeAssetPath(url);
}
