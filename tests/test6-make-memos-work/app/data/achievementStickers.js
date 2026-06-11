/**
 * Milestone stickers — separate from physical QR collectibles.
 * Replace emoji with /achievements/*.png assets when designs are ready.
 */
export const ACHIEVEMENTS = [
  {
    id: 'first-post',
    label: 'Your 1st post!',
    emoji: '✨',
    checkUnlocked: ({ memoCount }) => memoCount >= 1,
  },
  {
    id: 'party-animal',
    label: 'Party animal',
    emoji: '🪩',
    checkUnlocked: ({ collectedCount }) => collectedCount >= 2,
  },
  {
    id: 'og-traveller',
    label: 'OG traveller',
    emoji: '🌍',
    checkUnlocked: ({ collectedCount }) => collectedCount >= 1,
  },
  {
    id: 'bar-crawler',
    label: 'Bar crawler',
    emoji: '🥂',
    checkUnlocked: ({ favesCount }) => favesCount >= 1,
  },
  {
    id: 'antwerp-diva',
    label: "Antwerp's diva",
    emoji: '💅',
    checkUnlocked: ({ role }) => role === 'local',
  },
];

export function getAchievementStates(user, collectedCount) {
  const ctx = {
    memoCount: user?.collections?.memos ?? 0,
    favesCount: user?.collections?.faves ?? 0,
    collectedCount,
    role: user?.role,
  };

  return ACHIEVEMENTS.map(def => ({
    id: def.id,
    label: def.label,
    emoji: def.emoji,
    src: def.src ?? null,
    unlocked: def.checkUnlocked(ctx),
  }));
}
