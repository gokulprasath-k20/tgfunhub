import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getRedis() {
  return redis;
}

export async function setex(key: string, ttlSeconds: number, value: string) {
  await redis.set(key, value, { ex: ttlSeconds });
}

export async function get(key: string): Promise<string | null> {
  // @upstash/redis returns string or null (or any type if set was an object)
  // We'll cast to string | null as the existing signature expects
  const val = await redis.get(key);
  if (val === null) return null;
  return typeof val === 'string' ? val : JSON.stringify(val);
}

export async function del(key: string) {
  await redis.del(key);
}

export async function incr(key: string): Promise<number> {
  return await redis.incr(key);
}

export async function expire(key: string, ttlSeconds: number) {
  await redis.expire(key, ttlSeconds);
}
