import { enforceApiRateLimit, RATE_LIMITS } from '../utils/rateLimit.server';
import { loadStickersFromPublic } from '../utils/stickers.server';

export async function loader({ request }) {
  const limited = enforceApiRateLimit(request, 'api:stickers', RATE_LIMITS.stickers);
  if (limited) return limited;

  return Response.json(loadStickersFromPublic());
}
