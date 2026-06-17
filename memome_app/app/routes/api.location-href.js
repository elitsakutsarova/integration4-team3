import { resolveNavigableLocationHref } from '../utils/navigableLocation';

export function shouldRevalidate({ currentUrl, nextUrl }) {
  return currentUrl.search !== nextUrl.search;
}

export async function loader({ request }) {
  const url = new URL(request.url);
  const placeId = url.searchParams.get('placeId') ?? '';
  const lat = parseFloat(url.searchParams.get('lat') ?? '');
  const lng = parseFloat(url.searchParams.get('lng') ?? '');
  const name = url.searchParams.get('name') ?? '';

  const href = await resolveNavigableLocationHref({ placeId, lat, lng, name });
  return { href };
}

export async function clientLoader({ request }) {
  const url = new URL(request.url);
  const placeId = url.searchParams.get('placeId') ?? '';
  const lat = parseFloat(url.searchParams.get('lat') ?? '');
  const lng = parseFloat(url.searchParams.get('lng') ?? '');
  const name = url.searchParams.get('name') ?? '';

  const href = await resolveNavigableLocationHref({ placeId, lat, lng, name });
  return { href };
}
