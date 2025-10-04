import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const totalVotes = await prisma.vote.count()
    const recentVotes = await prisma.vote.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        number1: true,
        number2: true,
        winner: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ totalVotes, recentVotes })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}