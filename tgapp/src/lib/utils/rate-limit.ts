import { incr, expire, get } from '@/lib/db/redis';
import { NextRequest } from 'next/server';

const WINDOW_SECONDS = 15 * 60; // 15 minutes
const MAX_ATTEMPTS = 5;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

export async function rateLimit(
  req: NextRequest,
  identifier?: string
): Promise<{ success: boolean; remaining: number; resetIn: number }> {
  const ip = getClientIp(req);
  const key = `rl:${identifier || ip}`;

  const current = await incr(key);

  // Set TTL only on first request
  if (current === 1) {
    await expire(key, WINDOW_SECONDS);
  }

  const ttl = WINDOW_SECONDS;
  const remaining = Math.max(0, MAX_ATTEMPTS - current);

  return {
    success: current <= MAX_ATTEMPTS,
    remaining,
    resetIn: ttl,
  };
}

export async function checkRateLimit(identifier: string): Promise<boolean> {
  const key = `rl:${identifier}`;
  const value = await get(key);
  const count = value ? parseInt(value, 10) : 0;
  return count < MAX_ATTEMPTS;
}
