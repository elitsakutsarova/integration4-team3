// collect a sticker page
// when the user scans a sticker QR code, it automatically gives them a random digital sticker and show them the result

import '../styles/modules/collect.css';
import { redirect } from 'react-router';
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
import { writeStickerReveal } from '../utils/stickerReveal';

export function meta() {
  return [{ title: 'MemMe — Collect sticker' }];
}

// Open page → claim once per ?scan= key (cached in sessionStorage so refresh does not re-claim).
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
    throw redirect(paths.home);
  }

  const result = await hydrateCollectResult(await claimRandomSticker(session));
  writeCollectCache(scan, result, userId);

  if (result.sticker) {
    markPhysicalStickerScanned(userId ?? 'guest');
    writeStickerReveal({ ...result.sticker, claimedAt: result.claimedAt });
  }

  throw redirect(paths.home);
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return (
    <div className="collect-page">
      <div className="collect-card" />
    </div>
  );
}

/**
 * Only re-run the claim when this route's URL changes (e.g. ?scan= for rescan).
 * Root loader revalidation (login, sticker sync) must not re-claim here — that
 * caused an infinite revalidation loop and would duplicate claims on revisit.
 */
export function shouldRevalidate({ currentUrl, nextUrl }) {
  return (
    currentUrl.pathname !== nextUrl.pathname
    || currentUrl.search !== nextUrl.search
  );
}

export default function CollectSticker() {
  return null;
}
