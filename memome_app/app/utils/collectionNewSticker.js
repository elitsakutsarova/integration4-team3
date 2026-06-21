/** Id of the most recently collected sticker (by claimedAt), or null if none. */
export function getNewestCollectedStickerId(stickers) {
  if (!stickers?.length) return null;

  let newestId = null;
  let newestTime = Number.NEGATIVE_INFINITY;

  for (const sticker of stickers) {
    if (!sticker?.id || !sticker.claimedAt) continue;
    const claimedTime = Date.parse(sticker.claimedAt);
    if (!Number.isFinite(claimedTime) || claimedTime <= newestTime) continue;
    newestTime = claimedTime;
    newestId = sticker.id;
  }

  return newestId;
}
