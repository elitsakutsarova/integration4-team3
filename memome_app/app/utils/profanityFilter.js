import { PROFANITY_WORDS } from '../data/profanityWords';

const LEET_SUBSTITUTIONS = {
  '@': 'a',
  '4': 'a',
  '8': 'a',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '|': 'i',
  '0': 'o',
  '5': 's',
  '$': 's',
  '7': 't',
};

const TOKEN_SPLIT_RE = /[^a-z0-9@$!|]+/i;
const REPEATED_CHAR_RE = /(.)\1{2,}/gi;
const VARIANT_SUFFIX_MAX = 4;

function applyLeetSubstitutions(token) {
  let normalized = '';
  for (const char of token.toLowerCase()) {
    normalized += LEET_SUBSTITUTIONS[char] ?? char;
  }
  return normalized;
}

function normalizeToken(token) {
  const alpha = applyLeetSubstitutions(token).replace(/[^a-z]/g, '');
  return alpha.replace(REPEATED_CHAR_RE, '$1$1');
}

function isProfaneToken(token) {
  const normalized = normalizeToken(token);
  if (!normalized) return false;
  if (PROFANITY_WORDS.has(normalized)) return true;

  for (const word of PROFANITY_WORDS) {
    if (normalized.startsWith(word) && normalized.length <= word.length + VARIANT_SUFFIX_MAX) {
      return true;
    }
  }
  return false;
}

export function containsProfanity(text) {
  const value = String(text ?? '').trim();
  if (!value) return false;

  return value
    .split(TOKEN_SPLIT_RE)
    .filter(Boolean)
    .some(isProfaneToken);
}

export const PROFANITY_ERROR_MESSAGE =
  'Please remove inappropriate language from your description.';
