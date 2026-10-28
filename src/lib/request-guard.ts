type Bucket = { count: number; resetAt: number };
const globalForLimiter = globalThis as typeof globalThis & { __ludoRateLimit?: Map<string, Bucket> };
const buckets = globalForLimiter.__ludoRateLimit ?? new Map<string, Bucket>();
if (process.env.NODE_ENV !== "production") globalForLimiter.__ludoRateLimit = buckets;

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host.toLowerCase();
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const requestHost = (forwardedHost || request.headers.get("host") || new URL(request.url).host).toLowerCase();
    return originHost === requestHost;
  } catch {
    return false;
  }
}

export function publicRateLimit(request: Request, scope: string, limit = 6, windowMs = 15 * 60 * 1000) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [entry, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(entry);
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }
  if (bucket.count >= limit) return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  bucket.count += 1;
  return { allowed: true, retryAfter: 0 };
}

export function validEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}
