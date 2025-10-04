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

  // Don't render if no data
  if (distribution.length === 0) return null

  const hoveredData = hoveredBar !== null ? distribution[hoveredBar] : null

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="absolute bottom-0 left-0 right-0 h-32 pointer-events-auto"
      onMouseLeave={handleMouseLeave}
    >
      {/* Background gradient overlay for wallpaper effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      {/* Distribution bars */}
      <div className="flex items-end justify-center h-full px-4 gap-[1px] md:gap-[2px]">
        {distribution.map((data) => {
          const height = maxVotes > 0 ? (data.votes / maxVotes) * 100 : 0
          const isHovered = hoveredBar === data.number

          return (
            <motion.div
              key={data.number}
              className="relative flex-1 min-w-[1px] max-w-[4px] cursor-pointer"
              onMouseMove={(e) => handleMouseMove(e, data.number)}
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <motion.div
                className={`w-full bg-gradient-to-t ${
                  isHovered
                    ? 'from-white/30 to-white/15'
                    : data.votes > 0
                    ? 'from-white/15 to-white/8'
                    : 'from-white/6 to-white/3'
                } backdrop-blur-[1px] rounded-t-[1px] shadow-sm`}
                style={{
                  height: `${Math.max(height, data.votes > 0 ? 3 : 1)}%` // Minimum height based on votes
                }}
                animate={{
                  height: `${Math.max(height, data.votes > 0 ? 3 : 1)}%`,
                  opacity: isHovered ? 0.9 : data.votes > 0 ? 0.6 : 0.2
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 35,
                  duration: 0.5
                }}
              />

              {/* Glow effect on hover */}
              <AnimatePresence>
                {isHovered && data.votes > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 bg-white/25 blur-[2px] rounded-t-[1px]"
                    style={{ height: `${Math.max(height, data.votes > 0 ? 3 : 1)}%` }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
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