import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Use database aggregation to get vote counts efficiently
    const voteGroups = await prisma.vote.groupBy({
      by: ['winner'],
      _count: {
        winner: true,
      },
    })

    // Get total votes
    const totalVotes = await prisma.vote.count()

    // Create a map for quick lookup
    const voteCounts = new Map<number, number>()
    voteGroups.forEach(group => {
      voteCounts.set(group.winner, group._count.winner)
    })

    // Create array for all numbers 0-100 with vote counts
    const distribution = Array.from({ length: 101 }, (_, number) => {
      const voteCount = voteCounts.get(number) || 0
      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0

      return {
        number,
        votes: voteCount,
        percentage: parseFloat(percentage.toFixed(2))
      }
    })

    return NextResponse.json({
      distribution,
      totalVotes,
      maxVotes: Math.max(...distribution.map(d => d.votes), 1) // Ensure minimum of 1 for scaling
    })
  } catch (error) {
    console.error('Error fetching distribution:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}