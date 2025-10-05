import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { voteRateLimiter, getClientIp } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  // Apply rate limiting
  if (voteRateLimiter) {
    const ip = getClientIp(request)
    const { success, limit, remaining, reset } = await voteRateLimiter.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: 'Too many votes. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
          },
        }
      )
    }
  }

  try {
    const { number1, number2, winner } = await request.json()

    if (typeof number1 !== 'number' || typeof number2 !== 'number' || typeof winner !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    if (winner !== number1 && winner !== number2) {
      return NextResponse.json({ error: 'Winner must be one of the two numbers' }, { status: 400 })
    }

    await prisma.vote.create({
      data: {
        number1,
        number2,
        winner,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating vote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}