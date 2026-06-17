import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCollectedStickers } from '../context/CollectedStickersContext';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import { useCustomJournals } from '../context/CreateJournalContext';
import { useDiscoverFaves } from '../context/DiscoverFavesContext';
import { useSavedMemos } from '../context/SavedMemosContext';
import { useStickers } from '../context/StickerCatalogContext';
import { buildAchievementContext, getAchievementStates } from '../data/achievementStickers';

export function useOwnedStickerCount() {
  const { user } = useAuth();
  const collected = useCollectedStickers();
  const catalog = useStickers();
  const { createdMemos } = useCreatedMemos();
  const { customJournals } = useCustomJournals();
  const { memosCount: savedMemosCount } = useSavedMemos();
  const { favesCount: discoverFavesCount } = useDiscoverFaves();

  return useMemo(() => {
    const collectedCount = collected.length;

    if (!user) {
      return {
        collectedCount,
        achievementUnlocked: 0,
        totalCount: collectedCount,
        achievements: [],
      };
    }

    const achievements = getAchievementStates(
      user,
      collectedCount,
      buildAchievementContext({
        user,
        collectedCount,
        digitalCatalogTotal: catalog.length,
        createdMemos,
        customJournals,
        savedMemosCount,
        discoverFavesCount,
      }),
    );
    const achievementUnlocked = achievements.filter((item) => item.unlocked).length;

    return {
      collectedCount,
      achievementUnlocked,
      totalCount: collectedCount + achievementUnlocked,
      achievements,
    };
  }, [
    user,
    collected,
    catalog.length,
    createdMemos,
    customJournals,
    savedMemosCount,
    discoverFavesCount,
  ]);
}
