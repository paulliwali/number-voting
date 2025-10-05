import { Ratelimit } from '@upstash/ratelimit'
import type { Redis as UpstashRedis } from '@upstash/ratelimit'
import Redis from 'ioredis'

// Create Redis client wrapper that works with @upstash/ratelimit
let redis: UpstashRedis | undefined

if (process.env.REDIS_URL) {
  // Railway Redis using ioredis - wrap it to match Upstash interface
  const ioredisClient = new Redis(process.env.REDIS_URL)

  // Create adapter that implements Upstash Redis interface
  redis = {
    get: async (key: string) => {
      const result = await ioredisClient.get(key)
      return result
    },
    set: async (key: string, value: string, options?: { ex?: number; px?: number }) => {
      if (options?.ex) {
        await ioredisClient.setex(key, options.ex, value)
      } else if (options?.px) {
        await ioredisClient.psetex(key, options.px, value)
      } else {
        await ioredisClient.set(key, value)
      }
      return 'OK'
    },
    sadd: async (key: string, ...members: string[]) => {
      return await ioredisClient.sadd(key, ...members)
    },
    eval: async (script: string, keys: string[], args: string[]) => {
      return await ioredisClient.eval(script, keys.length, ...keys, ...args)
    },
  } as UpstashRedis
}

// Vote rate limiter: 10 votes per minute per IP
export const voteRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'ratelimit:vote',
    })
  : null

// Numbers rate limiter: 30 requests per minute per IP
export const numbersRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      analytics: true,
      prefix: 'ratelimit:numbers',
    })
  : null

// Helper function to get client IP
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  return 'unknown'
}
