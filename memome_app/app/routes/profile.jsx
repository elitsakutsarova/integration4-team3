import { useMemo } from 'react';
import { useLoaderData } from 'react-router';
import { useAuth } from '../context/AuthContext';
import GuestAuthCta from '../components/GuestAuthCta';
import ProfileHero from '../components/profile/ProfileHero';
import ProfileCollections from '../components/profile/ProfileCollections';
import RememberMemosSection from '../components/profile/RememberMemosSection';
import { useCollectedStickers } from '../context/CollectedStickersContext';
import { useCreatedMemos } from '../context/CreatedMemosContext';
import { useDiscoverFaves } from '../context/DiscoverFavesContext';
import { useSavedMemos } from '../context/SavedMemosContext';
import { useUserAvatar } from '../hooks/useUserAvatar';
import { paths } from '../utils/appPaths';
import { getAuthSnapshot } from '../utils/authSession';
import { fetchCreatedMemosByUser } from '../utils/memoStore';
import { resolveNavigableLocationHref } from '../utils/navigableLocation';
import { mergeFeaturedMemos, pickOldestMemos } from '../utils/profileMemos';

export function meta() {
  return [
    { title: 'MemoMe — Profile' },
    { name: 'description', content: 'Your memos, collections, and memories on the map.' },
  ];
}

async function enrichWithLocationHref(memo) {
  const locationHref = await resolveNavigableLocationHref({
    placeId: memo.placeId,
    lat: memo.ll?.[0],
    lng: memo.ll?.[1],
    name: memo.location,
  });
  return { ...memo, locationHref };
}

export async function clientLoader() {
  const { user } = getAuthSnapshot();
  if (!user?.id) {
    return { featuredMemos: [] };
  }

  const raw = await fetchCreatedMemosByUser(user.id);
  const featuredMemos = await Promise.all(
    pickOldestMemos(raw).map(enrichWithLocationHref),
  );
  return { featuredMemos };
}

clientLoader.hydrate = true;

export function shouldRevalidate() {
  return false;
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
        settingsHref={paths.login}
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
  const { featuredMemos: loaderFeaturedMemos } = useLoaderData();
  const collectedStickers = useCollectedStickers();
  const { createdMemos, createdCount, ready: createdReady } = useCreatedMemos();
  const { memosCount: savedMemosCount, ready: savedReady } = useSavedMemos();
  const { favesCount: discoverFavesCount, ready: discoverReady } = useDiscoverFaves();
  const { user } = useAuth();
  const avatarUrl = useUserAvatar(user?.id);

  const featuredMemos = useMemo(
    () => mergeFeaturedMemos(createdMemos, loaderFeaturedMemos),
    [createdMemos, loaderFeaturedMemos],
  );

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
        stickersCount={collectedStickers.length}
      />

      <RememberMemosSection memos={featuredMemos} />
    </div>
  );
}
