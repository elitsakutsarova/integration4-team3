// route for the memo archive page at a location

import { useLoaderData } from 'react-router';
import MemoArchivePage from '../components/memos/MemoArchivePage';
import { loadSpotMemos } from '../utils/loadSpotMemos';
import { parseLocationRoute } from '../utils/parseLocationRoute';

export function meta({ data: loaderData }) {
  const title = loaderData?.spotTitle ?? 'Memo Archive';
  return [
    { title: `MemoMe — ${title} memos` },
    { name: 'description', content: `Browse memos tagged at ${title}.` },
  ];
}

export async function clientLoader(args) {
  const { placeId, lat, lng, locationName, spotTitle } = parseLocationRoute(args);

  const { archiveMemos, totalMemoCount } = await loadSpotMemos({
    placeId,
    lat,
    lng,
    locationName,
  });

  return {
    spotTitle,
    locationName,
    memos: archiveMemos,
    memoCount: totalMemoCount,
  };
}

clientLoader.hydrate = true;

export default function LocationMemoArchiveRoute() {
  const { spotTitle, locationName, memos, memoCount } = useLoaderData();
  return (
    <MemoArchivePage
      spotTitle={spotTitle}
      locationName={locationName}
      memos={memos}
      memoCount={memoCount}
    />
  );
}
