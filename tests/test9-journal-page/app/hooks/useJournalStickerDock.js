import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCollectedStickers } from '../context/CollectedStickersContext';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import { useDiscoverFaves } from '../context/DiscoverFavesContext';
import { useSavedMemos } from '../context/SavedMemosContext';
import { useStickers } from '../context/StickerCatalogContext';
import { getAchievementStates } from '../data/achievementStickers';

/** Catalog + collected + unlocked achievement stickers for the journal dock. */
export function useJournalStickerDock() {
  const catalogStickers = useStickers();
  const collectedStickers = useCollectedStickers();
  const { user } = useAuth();
  const { createdCount } = useCreatedMemos();
  const { memosCount: savedMemosCount } = useSavedMemos();
  const { favesCount: discoverFavesCount } = useDiscoverFaves();

  return useMemo(() => {
    const byId = new Map();

    for (const sticker of catalogStickers) byId.set(sticker.id, sticker);
    for (const sticker of collectedStickers) byId.set(sticker.id, sticker);

    const achievements = getAchievementStates(user, collectedStickers.length, {
      memoCount: createdCount,
      favesCount: savedMemosCount + discoverFavesCount,
    });

    for (const achievement of achievements) {
      if (!achievement.unlocked) continue;
      byId.set(`achievement-${achievement.id}`, {
        id: `achievement-${achievement.id}`,
        label: achievement.label,
        emoji: achievement.emoji,
        src: achievement.src,
      });
    }

    return [...byId.values()];
  }, [
    catalogStickers,
    collectedStickers,
    createdCount,
    discoverFavesCount,
    savedMemosCount,
    user,
  ]);
}
