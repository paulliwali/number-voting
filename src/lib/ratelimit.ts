import { Ratelimit } from '@upstash/ratelimit'
import { Redis as UpstashRedis } from '@upstash/redis'
import Redis from 'ioredis'

// Create Redis client
// Supports both Railway Redis (REDIS_URL) and Upstash Redis (UPSTASH_REDIS_REST_URL)
let redis: UpstashRedis | Redis | undefined

if (process.env.REDIS_URL) {
  // Railway Redis using ioredis
  redis = new Redis(process.env.REDIS_URL)
} else if (process.env.UPSTASH_REDIS_REST_URL) {
  // Upstash Redis using REST API
  redis = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  })
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
