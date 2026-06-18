/** Simple in-memory per-IP rate limiting for API routes (fixed window). */

export const RATE_LIMITS = {
  locationSearch: { max: 30, windowMs: 60_000 },
  stickers: { max: 60, windowMs: 60_000 },
  memos: { max: 10, windowMs: 60_000 },
  account: { max: 20, windowMs: 60_000 },
  feedback: { max: 5, windowMs: 60_000 },
  resetPassword: { max: 10, windowMs: 60_000 },
};

const buckets = new Map();

function pruneExpired(now) {
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return 'unknown';
}

function consumeToken(key, { max, windowMs }) {
  const now = Date.now();
  if (buckets.size > 10_000) pruneExpired(now);

  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;

  entry.count += 1;
  return true;
}

export function isRateLimited(request, bucket, limits, scope = null) {
  const ip = getClientIp(request);
  const identity = scope || ip || 'unknown';
  const key = `${bucket}:${identity}`;
  return !consumeToken(key, limits);
}

export function rateLimitResponse(limits) {
  const retryAfter = Math.ceil(limits.windowMs / 1000);
  return Response.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
    },
  );
}

/** Returns a 429 Response when limited, otherwise null. */
export function enforceApiRateLimit(request, bucket, limits) {
  if (isRateLimited(request, bucket, limits)) {
    return rateLimitResponse(limits);
  }
  return null;
}

export function rateLimitActionError(request, bucket, limits, scope = null) {
  if (!isRateLimited(request, bucket, limits, scope)) return null;
  return {
    error: 'Too many requests. Please try again in a minute.',
    status: 429,
  };
}
