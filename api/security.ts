import type { Request, Response, NextFunction } from 'express';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const buckets = new Map<string, { count: number; resetAt: number }>();

export const LIMITS = {
  transcript: 4_000,
  query: 2_000,
  moments: 100,
  checkIns: 100,
} as const;

function clientKey(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return (raw?.split(',')[0]?.trim() || req.ip || 'unknown').slice(0, 128);
}

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = clientKey(req);
  const existing = buckets.get(key);
  const bucket = !existing || existing.resetAt <= now
    ? { count: 0, resetAt: now + WINDOW_MS }
    : existing;

  bucket.count += 1;
  buckets.set(key, bucket);

  res.setHeader('RateLimit-Limit', String(MAX_REQUESTS));
  res.setHeader('RateLimit-Remaining', String(Math.max(0, MAX_REQUESTS - bucket.count)));
  res.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > MAX_REQUESTS) {
    res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
    return res.status(429).json({ error: 'Too many requests' });
  }

  next();
}

export function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.replace(/\u0000/g, '').trim();
  if (!text || text.length > maxLength) return null;
  return text;
}

export function safeArray(value: unknown, maxItems: number): any[] | null {
  if (!Array.isArray(value) || value.length > maxItems) return null;
  return value;
}

export function publicError(res: Response, status: number, error: string) {
  return res.status(status).json({ error });
}

export function applyApiSecurityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
}
