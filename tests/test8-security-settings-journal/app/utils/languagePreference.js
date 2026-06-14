const STORAGE_KEY = 'memome_language';

export const LANGUAGE_OPTIONS = [
  { id: 'en', label: 'English' },
  { id: 'nl', label: 'Nederlands' },
  { id: 'fr', label: 'Français' },
];

const LANGUAGE_LABELS = Object.fromEntries(
  LANGUAGE_OPTIONS.map((option) => [option.id, option.label]),
);

export function getLanguagePreference() {
  if (typeof window === 'undefined') return 'en';

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGUAGE_LABELS[stored]) return stored;
  } catch {
    // ignore corrupt storage
  }

  return 'en';
}

export function setLanguagePreference(languageId) {
  if (!LANGUAGE_LABELS[languageId]) return getLanguagePreference();

  try {
    localStorage.setItem(STORAGE_KEY, languageId);
  } catch {
    // ignore quota errors
  }

  return languageId;
}

export function getLanguageLabel(languageId = getLanguagePreference()) {
  return LANGUAGE_LABELS[languageId] ?? LANGUAGE_LABELS.en;
}
