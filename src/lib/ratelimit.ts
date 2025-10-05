import { Ratelimit } from '@upstash/ratelimit'
import Redis from 'ioredis'

// Type definition for Redis client compatible with @upstash/ratelimit
// The library expects get/set methods with generic types, but only uses strings at runtime
interface UpstashRedisCompatible {
  get: <TData = string>(key: string) => Promise<TData | null>
  set: <TData = string>(
    key: string,
    value: TData,
    options?:
      | { ex: number; px?: never }
      | { px: number; ex?: never }
      | { ex?: never; px?: never }
  ) => Promise<'OK' | TData | null>
  sadd: <TData = number>(key: string, ...members: string[]) => Promise<TData>
  eval: <TArgs extends unknown[], TData = unknown>(
    script: string,
    keys: string[],
    args: TArgs
  ) => Promise<TData>
}

// Create Redis client wrapper that works with @upstash/ratelimit
let redis: UpstashRedisCompatible | undefined

if (process.env.REDIS_URL) {
  // Railway Redis using ioredis - wrap it to match Upstash interface
  const ioredisClient = new Redis(process.env.REDIS_URL)

  // Create adapter that implements Upstash Redis interface
  redis = {
    get: async <TData = string>(key: string): Promise<TData | null> => {
      const result = await ioredisClient.get(key)
      return result as TData | null
    },
    set: async <TData = string>(
      key: string,
      value: TData,
      options?:
        | { ex: number; px?: never }
        | { px: number; ex?: never }
        | { ex?: never; px?: never }
    ): Promise<'OK' | TData | null> => {
      const stringValue = String(value)
      if (options?.ex) {
        await ioredisClient.setex(key, options.ex, stringValue)
      } else if (options?.px) {
        await ioredisClient.psetex(key, options.px, stringValue)
      } else {
        await ioredisClient.set(key, stringValue)
      }
      return 'OK'
    },
    sadd: async <TData = number>(key: string, ...members: string[]): Promise<TData> => {
      const result = await ioredisClient.sadd(key, ...members)
      return result as TData
    },
    eval: async <TArgs extends unknown[], TData = unknown>(
      script: string,
      keys: string[],
      args: TArgs
    ): Promise<TData> => {
      const result = await ioredisClient.eval(
        script,
        keys.length,
        ...keys,
        ...(args as string[])
      )
      return result as TData
    },
  }
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
