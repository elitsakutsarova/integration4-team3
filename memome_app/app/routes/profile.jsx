import '../styles/modules/profile.css';
import '../styles/modules/profile-collections.css';
import '../styles/modules/map.css';
import '../styles/modules/diary.css';
import { useAuth } from '../context/AuthContext';
import GuestAuthCta from '../components/GuestAuthCta';
import ProfileHero from '../components/profile/ProfileHero';
import ProfileCollections from '../components/profile/ProfileCollections';
import RememberMemosSection from '../components/profile/RememberMemosSection';
import { useCollectedStickers } from '../context/CollectedStickersContext';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import { useDiscoverFaves } from '../context/DiscoverFavesContext';
import { useSavedMemos } from '../context/SavedMemosContext';
import { useFeaturedMemosWithHrefs } from '../hooks/useFeaturedMemosWithHrefs';
import { useOwnedStickerCount } from '../hooks/useOwnedStickerCount';
import { useUserAvatar } from '../hooks/useUserAvatar';

export function meta() {
  return [
    { title: 'MemoMe — Profile' },
    { name: 'description', content: 'Your memos, collections, and memories on the map.' },
  ];
}

function GuestProfile({ collectedStickers }) {
  const featuredSticker = collectedStickers[0];

  return (
    <div className="profile-page profile-page--account profile-page--guest">
      <ProfileHero
        username="@?????"
        tags={[]}
        avatarUrl={null}
        hasCustomAvatar={false}
        settingsDisabled
      />

      <ProfileCollections
        locked
        featuredStickerSrc={featuredSticker?.src}
      />

      <RememberMemosSection memos={[]} showAddCta={false} />

      <section className="guest-create-account">
        <GuestAuthCta copy="Create account or log in to add memos" />
      </section>
    </div>
  );
}

export default function Profile() {
  const collectedStickers = useCollectedStickers();
  const { createdMemos, createdCount, ready: createdReady } = useCreatedMemos();
  const { memosCount: savedMemosCount, ready: savedReady } = useSavedMemos();
  const { favesCount: discoverFavesCount, ready: discoverReady } = useDiscoverFaves();
  const { user } = useAuth();
  const avatarUrl = useUserAvatar(user?.id);
  const featuredMemos = useFeaturedMemosWithHrefs(createdMemos);
  const { totalCount: stickersCount } = useOwnedStickerCount();

  if (!user) {
    return <GuestProfile collectedStickers={collectedStickers} />;
  }

  const favouritesCount = savedMemosCount + discoverFavesCount;
  const favouritesReady = savedReady && discoverReady;
  const memosLabel = createdReady ? createdCount : (user?.collections?.memos ?? '…');
  const favouritesLabel = favouritesReady ? favouritesCount : (user?.collections?.faves ?? '…');

  return (
    <div className="profile-page profile-page--account">
      <ProfileHero
        username={user.username ?? '@guest'}
        tags={user.tags ?? []}
        avatarUrl={avatarUrl}
        hasCustomAvatar={Boolean(avatarUrl)}
      />

      <ProfileCollections
        memosLabel={memosLabel}
        favouritesLabel={favouritesLabel}
        stickersCount={stickersCount}
      />

      <RememberMemosSection memos={featuredMemos} />
    </div>
  );
}
