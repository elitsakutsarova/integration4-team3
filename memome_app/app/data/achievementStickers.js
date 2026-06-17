/**
 * Milestone stickers — separate from QR collectibles.
 * Assets live in public/achievementStickers/.
 */
import { hasMemoNearDiscoverEvent } from '../utils/achievementEventVicinity';
import { getAchievementProgress } from '../utils/achievementProgressStore';

export const ACHIEVEMENT_TOTAL = 13;
export const DIGITAL_STICKER_CATALOG_TOTAL = 23;

export const ACHIEVEMENTS = [
  {
    id: '01',
    label: 'Your 1st post!',
    checkUnlocked: ({ memoCount }) => memoCount >= 1,
  },
  {
    id: '02',
    label: 'Welcome aboard',
    checkUnlocked: ({ hasOpenedApp }) => hasOpenedApp,
  },
  {
    id: '03',
    label: 'Journal keeper',
    checkUnlocked: ({ customJournalCount }) => customJournalCount >= 1,
  },
  {
    id: '04',
    label: 'Super fan',
    checkUnlocked: ({ heartsCount }) => heartsCount >= 10,
  },
  {
    id: '05',
    label: 'Festival vibes',
    checkUnlocked: ({ postedNearEvent }) => postedNearEvent,
  },
  {
    id: '06',
    label: 'Collector pro',
    checkUnlocked: ({ collectedCount, digitalCatalogTotal }) => (
      digitalCatalogTotal > 0 && collectedCount >= digitalCatalogTotal
    ),
  },
  {
    id: '07',
    label: 'QR scout',
    checkUnlocked: ({ hasScannedPhysicalSticker }) => hasScannedPhysicalSticker,
  },
  {
    id: '08',
    label: 'Memo maker',
    checkUnlocked: ({ memoCount }) => memoCount >= 10,
  },
  {
    id: '09',
    label: 'Storyteller',
    checkUnlocked: ({ memoCount }) => memoCount >= 20,
  },
  {
    id: '10',
    label: 'Spreading joy',
    checkUnlocked: ({ hasSharedContent }) => hasSharedContent,
  },
  {
    id: '11',
    label: 'Memo marathon',
    checkUnlocked: ({ memoCount }) => memoCount >= 30,
  },
  {
    id: '12',
    label: 'Memory machine',
    checkUnlocked: ({ memoCount }) => memoCount >= 50,
  },
  {
    id: '13',
    label: 'Antwerp legend',
    checkUnlocked: ({ memoCount }) => memoCount >= 100,
  },
].map((def) => ({
  ...def,
  src: `/achievementStickers/a_sticker${Number(def.id)}.svg`,
}));

export function buildAchievementContext({
  user,
  collectedCount = 0,
  digitalCatalogTotal = DIGITAL_STICKER_CATALOG_TOTAL,
  createdMemos = [],
  customJournals = [],
  savedMemosCount = 0,
  discoverFavesCount = 0,
}) {
  const progress = getAchievementProgress(user?.id);

  return {
    memoCount: createdMemos.length,
    heartsCount: savedMemosCount + discoverFavesCount,
    collectedCount,
    digitalCatalogTotal,
    customJournalCount: customJournals.filter(journal => !journal.deleted).length,
    postedNearEvent: hasMemoNearDiscoverEvent(createdMemos),
    hasOpenedApp: progress.hasOpenedApp,
    hasScannedPhysicalSticker: progress.hasScannedPhysicalSticker,
    hasSharedContent: progress.hasSharedContent,
  };
}

export function getAchievementStates(user, collectedCount, overrides = {}) {
  if (!user) {
    return ACHIEVEMENTS.map(def => ({
      id: def.id,
      label: def.label,
      src: def.src,
      unlocked: false,
    }));
  }

  const ctx = {
    memoCount: 0,
    heartsCount: 0,
    collectedCount,
    digitalCatalogTotal: DIGITAL_STICKER_CATALOG_TOTAL,
    customJournalCount: 0,
    postedNearEvent: false,
    hasOpenedApp: false,
    hasScannedPhysicalSticker: false,
    hasSharedContent: false,
    ...overrides,
  };

  return ACHIEVEMENTS.map(def => ({
    id: def.id,
    label: def.label,
    src: def.src,
    unlocked: def.checkUnlocked(ctx),
  }));
}
