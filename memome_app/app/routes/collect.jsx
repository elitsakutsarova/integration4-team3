// collect a sticker page
// when the user scans a sticker QR code, it automatically gives them a random digital sticker and show them the result

import { useEffect } from 'react';
import { useFetcher, useLoaderData, useNavigate } from 'react-router';
import '../styles/modules/collect.css';
import {
  claimRandomSticker,
  hydrateCollectResult,
} from '../utils/collectibleStore';
import {
  getScanKey,
  readCollectCache,
  writeCollectCache,
} from '../utils/collectClaimCache';
import { bootstrapAuthSession } from '../utils/authSession';
import { paths } from '../utils/appPaths';
import { markPhysicalStickerScanned } from '../utils/achievementProgressStore';
import { writeLastNewStickerId } from '../utils/collectionNewSticker';
import { writeStickerReveal } from '../utils/stickerReveal';

export function meta() {
  return [{ title: 'MemMe — Collect sticker' }];
}

/** Read cache only — claiming runs in clientAction so root can revalidate collections. */
export async function clientLoader({ request }) {
  const session = await bootstrapAuthSession();
  const userId = session?.id ?? null;
  const scan = getScanKey(request);
  const cached = readCollectCache(scan, userId);

  if (cached) {
    const result = await hydrateCollectResult(cached);
    writeCollectCache(scan, result, userId);
    if (result.sticker) {
      markPhysicalStickerScanned(userId ?? 'guest');
    }
    return { result, needsClaim: false };
  }

  return { result: null, needsClaim: true };
}

clientLoader.hydrate = true;

export async function clientAction({ request }) {
  const session = await bootstrapAuthSession();
  const userId = session?.id ?? null;
  const scan = getScanKey(request);

  const cached = readCollectCache(scan, userId);
  if (cached) {
    return { result: await hydrateCollectResult(cached) };
  }

  const result = await hydrateCollectResult(await claimRandomSticker(session));
  writeCollectCache(scan, result, userId);

  if (result.sticker) {
    markPhysicalStickerScanned(userId ?? 'guest');
    writeLastNewStickerId(result.sticker.id);
    writeStickerReveal({ ...result.sticker, claimedAt: result.claimedAt });
  }

  return { result };
}

/**
 * Re-run loader only when ?scan= changes. Skip after POST — cache is written in clientAction.
 * Root loader revalidates via formAction (see root shouldRevalidate) to refresh sticker collection.
 */
export function shouldRevalidate({ formAction, currentUrl, nextUrl }) {
  if (formAction) return false;
  return (
    currentUrl.pathname !== nextUrl.pathname
    || currentUrl.search !== nextUrl.search
  );
}

export function HydrateFallback() {
  return (
    <div className="collect-page">
      <div className="collect-card" />
    </div>
  );
}

export default function CollectSticker() {
  const { result: loaderResult, needsClaim } = useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const result = fetcher.data?.result ?? loaderResult;

  useEffect(() => {
    if (!needsClaim || fetcher.data || fetcher.state !== 'idle') return;
    fetcher.submit({}, { method: 'post' });
  }, [needsClaim, fetcher]);

  useEffect(() => {
    if (!result) return;
    if (needsClaim && fetcher.state !== 'idle') return;
    navigate(paths.home, { replace: true });
  }, [result, needsClaim, fetcher.state, navigate]);

  return (
    <div className="collect-page">
      <div className="collect-card" />
    </div>
  );
}
