const STORAGE_KEY = 'memome_privacy';

export const PRIVACY_SETTINGS = [
  {
    id: 'trackLocation',
    label: 'Track location',
    description: 'The app has access to your location',
    iconKey: 'trackLocationIcon',
  },
  {
    id: 'camera',
    label: 'Camera',
    description: 'The app has access to your camera',
    iconKey: 'cameraIcon',
  },
  {
    id: 'photos',
    label: 'Photos',
    description: 'The app has access to your gallery',
    iconKey: 'photosIcon',
  },
];

const DEFAULT_PRIVACY = {
  trackLocation: true,
  camera: true,
  photos: true,
};

const VALID_KEYS = new Set(PRIVACY_SETTINGS.map((setting) => setting.id));

function readStored() {
  if (typeof window === 'undefined') return { ...DEFAULT_PRIVACY };

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    if (!stored || typeof stored !== 'object') return { ...DEFAULT_PRIVACY };

    return {
      ...DEFAULT_PRIVACY,
      ...Object.fromEntries(
        Object.entries(stored).filter(([key, value]) => VALID_KEYS.has(key) && typeof value === 'boolean'),
      ),
    };
  } catch {
    return { ...DEFAULT_PRIVACY };
  }
}

export function getPrivacyPreferences() {
  return readStored();
}

export function getPrivacyPreference(settingId) {
  return readStored()[settingId] ?? DEFAULT_PRIVACY[settingId] ?? false;
}

export function setPrivacyPreference(settingId, enabled) {
  if (!VALID_KEYS.has(settingId)) return getPrivacyPreferences();

  const next = { ...readStored(), [settingId]: Boolean(enabled) };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota errors
  }

  return next;
}

export function togglePrivacyPreference(settingId) {
  const current = getPrivacyPreference(settingId);
  return setPrivacyPreference(settingId, !current);
}
