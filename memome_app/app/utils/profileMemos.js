const FEATURED_MEMO_LIMIT = 5;

export function pickOldestMemos(memos, limit = FEATURED_MEMO_LIMIT) {
  return [...memos]
    .sort(
      (a, b) =>
        new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
    )
    .slice(0, limit);
}

export function mergeFeaturedMemos(liveMemos, loaderMemos) {
  const hrefById = new Map(
    loaderMemos.map((memo) => [memo.id, memo.locationHref ?? null]),
  );

  return pickOldestMemos(liveMemos).map((memo) => ({
    ...memo,
    locationHref: hrefById.get(memo.id) ?? memo.locationHref ?? null,
  }));
}
