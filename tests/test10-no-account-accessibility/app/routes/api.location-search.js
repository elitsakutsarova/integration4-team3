import { enforceApiRateLimit, RATE_LIMITS } from '../utils/rateLimit.server';
import { searchAntwerpPlaces } from '../utils/locationSearch.server';
import { validateSearchQuery } from '../utils/validators';

export async function loader({ request }) {
  const limited = enforceApiRateLimit(request, 'api:location-search', RATE_LIMITS.locationSearch);
  if (limited) return limited;

  const raw = new URL(request.url).searchParams.get('q') ?? '';
  const { value: q } = validateSearchQuery(raw);
  const result = await searchAntwerpPlaces(q);
  return Response.json(result);
}
