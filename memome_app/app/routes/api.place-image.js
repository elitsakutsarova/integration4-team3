import { fetchPlaceImageUrl } from '../utils/placeImage';
import { isValidOsmRouteParams } from '../utils/appPaths';

export async function loader({ request }) {
  const url = new URL(request.url);
  const osmType = url.searchParams.get('osmType') ?? '';
  const osmId = url.searchParams.get('osmId') ?? '';

  if (!isValidOsmRouteParams(osmType, osmId)) {
    return { imageUrl: null };
  }

  const imageUrl = await fetchPlaceImageUrl({
    osmType: osmType.toUpperCase(),
    osmId,
  }).catch(() => null);

  return { imageUrl };
}

export async function clientLoader({ serverLoader }) {
  return serverLoader();
}
