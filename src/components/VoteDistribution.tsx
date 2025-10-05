'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DistributionData {
  number: number
  votes: number
  percentage: number
}

interface VoteDistributionProps {
  onDataUpdate?: () => void
}

export default function VoteDistribution({ onDataUpdate }: VoteDistributionProps) {
  const [distribution, setDistribution] = useState<DistributionData[]>([])
  const [maxVotes, setMaxVotes] = useState(1)
  const [totalVotes, setTotalVotes] = useState(0)
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchDistribution = async () => {
    try {
      const response = await fetch('/api/distribution')
      const data = await response.json()
      setDistribution(data.distribution)
      setMaxVotes(data.maxVotes)
      setTotalVotes(data.totalVotes)
      onDataUpdate?.()
    } catch (error) {
      console.error('Error fetching distribution:', error)
    }
  }

  const handleMouseMove = (event: React.MouseEvent, number: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      })
    }
    setHoveredBar(number)
  }

  const handleMouseLeave = () => {
    setHoveredBar(null)
  }

  useEffect(() => {
    fetchDistribution()
    // Poll for updates every 3 seconds
    const interval = setInterval(fetchDistribution, 3000)
    return () => clearInterval(interval)
  }, [])

  // Always render, even with no data (to show empty state)
  // if (distribution.length === 0) return null

  const hoveredData = hoveredBar !== null ? distribution[hoveredBar] : null

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay: 0.3 }}
      className="absolute inset-0 pointer-events-auto z-[1]"
      onMouseLeave={handleMouseLeave}
    >

      {/* Background gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent" />

      {/* X-axis with range labels - positioned below bars */}
      <div className="absolute bottom-0 left-0 right-0 h-12 flex items-center px-8 sm:px-12 md:px-16 lg:px-24">
        <div className="flex-1 text-center text-white/40 text-xs font-medium">0-25</div>
        <div className="flex-1 text-center text-white/40 text-xs font-medium">25-50</div>
        <div className="flex-1 text-center text-white/40 text-xs font-medium">50-75</div>
        <div className="flex-1 text-center text-white/40 text-xs font-medium">75-100</div>
      </div>

      {/* Distribution bars with edge buffer - scaled to max 40% height */}
      <div className="absolute bottom-12 left-0 right-0 h-[calc(100%-3rem)]">
        <div className="flex items-end justify-center h-full px-8 sm:px-12 md:px-16 lg:px-24 gap-[1px]">
          {distribution.map((data) => {
            // Scale height to max 40% of screen
            const scaledHeight = maxVotes > 0 ? (data.votes / maxVotes) * 40 : 0
            const isHovered = hoveredBar === data.number

            // Minimalist color scheme - subtle and refined
            let bgColor = 'rgba(255, 255, 255, 0.15)' // default subtle white
            if (data.votes > 0) bgColor = 'rgba(96, 165, 250, 0.35)' // subtle blue
            if (data.votes > maxVotes * 0.4) bgColor = 'rgba(147, 107, 216, 0.4)' // subtle purple
            if (data.votes > maxVotes * 0.7) bgColor = 'rgba(236, 72, 153, 0.45)' // subtle pink
            if (isHovered) bgColor = 'rgba(34, 211, 238, 0.6)' // brighter cyan on hover

            return (
              <div
                key={data.number}
                className="relative flex-1 min-w-[2px] max-w-[12px] cursor-pointer transition-all duration-200 rounded-t-sm"
                onMouseMove={(e) => handleMouseMove(e, data.number)}
                style={{
                  height: `${Math.max(scaledHeight, data.votes > 0 ? 3 : 1.5)}%`,
                  backgroundColor: bgColor,
                  transform: isHovered ? 'scaleX(1.2) scaleY(1.1)' : 'scaleX(1) scaleY(1)'
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Hover annotation */}
      <AnimatePresence>
        {hoveredData && hoveredData.votes > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute pointer-events-none z-10"
            style={{
              left: `${mousePosition.x}px`,
              top: `${Math.max(mousePosition.y - 60, 10)}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="bg-black/80 backdrop-blur-md rounded-lg px-3 py-2 text-white text-sm font-medium border border-white/20 shadow-xl">
              <div className="text-center">
                <div className="text-lg font-bold">{hoveredData.number}</div>
                <div className="text-xs text-white/80">
                  {hoveredData.votes} vote{hoveredData.votes !== 1 ? 's' : ''}
                  ({hoveredData.percentage}%)
                </div>
              </div>
              {/* Arrow pointing down */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle grid lines for reference */}
      <div className="absolute inset-0 pointer-events-none">
        {[20, 40, 60, 80].map((percentage) => (
          <div
            key={percentage}
            className="absolute left-0 right-0 border-t border-white/3"
            style={{ bottom: `${percentage}%` }}
          />
        ))}
      </div>
    </motion.div>
  )
}