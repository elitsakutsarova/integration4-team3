import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCollectedStickers } from '../context/CollectedStickersContext';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import { useCustomJournals } from '../context/CreateJournalContext';
import { useDiscoverFaves } from '../context/DiscoverFavesContext';
import { useSavedMemos } from '../context/SavedMemosContext';
import { useStickers } from '../context/StickerCatalogContext';
import {
  buildAchievementContext,
  getAchievementStates,
} from '../data/achievementStickers';

/** Digital catalog + collected + achievements — for rendering placed journal stickers. */
export function useDiaryStickerCatalog() {
  const catalogStickers = useStickers();
  const collectedStickers = useCollectedStickers();
  const { user } = useAuth();
  const { createdMemos } = useCreatedMemos();
  const { customJournals } = useCustomJournals();
  const { memosCount: savedMemosCount } = useSavedMemos();
  const { favesCount: discoverFavesCount } = useDiscoverFaves();

  return useMemo(() => {
    const byId = new Map();
    for (const sticker of catalogStickers) byId.set(sticker.id, sticker);
    for (const sticker of collectedStickers) byId.set(sticker.id, sticker);

    const achievements = getAchievementStates(
      user,
      collectedStickers.length,
      buildAchievementContext({
        user,
        collectedCount: collectedStickers.length,
        digitalCatalogTotal: catalogStickers.length,
        createdMemos,
        customJournals,
        savedMemosCount,
        discoverFavesCount,
      }),
    );

    for (const achievement of achievements) {
      if (!achievement.unlocked) continue;
      byId.set(`achievement-${achievement.id}`, {
        id: `achievement-${achievement.id}`,
        label: achievement.label,
        src: achievement.src,
      });
    }

    return [...byId.values()];
  }, [
    catalogStickers,
    collectedStickers,
    createdMemos,
    customJournals,
    discoverFavesCount,
    savedMemosCount,
    user,
  ]);
}
