'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VoteDistribution from './VoteDistribution'

interface NumberPair {
  number1: number
  number2: number
}

const VOTE_TRANSITION_DELAY_MS = 800

export default function VotingInterface() {
  const [numbers, setNumbers] = useState<NumberPair>({ number1: 0, number2: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [totalVotes, setTotalVotes] = useState<number | null>(null)
  const [isVoting, setIsVoting] = useState(false)

  const fetchNewNumbers = async () => {
    try {
      const response = await fetch('/api/numbers')
      const data = await response.json()
      setNumbers(data)
    } catch (error) {
      console.error('Error fetching numbers:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setTotalVotes(data.totalVotes)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleVote = async (winner: number) => {
    if (isVoting) return

    setIsVoting(true)
    setIsLoading(true)

    // Optimistically update vote count
    setTotalVotes(prev => (prev ?? 0) + 1)

    try {
      // Submit vote and fetch new numbers in parallel for faster response
      const [voteResponse, newNumbersResponse] = await Promise.all([
        fetch('/api/vote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            number1: numbers.number1,
            number2: numbers.number2,
            winner,
          }),
        }),
        fetch('/api/numbers')
      ])

      if (voteResponse.ok && newNumbersResponse.ok) {
        const newNumbers = await newNumbersResponse.json()

        // Short delay for smooth animation transition
        setTimeout(() => {
          setNumbers(newNumbers)
          setIsLoading(false)
          setIsVoting(false)
        }, 300)
      } else {
        // Revert optimistic update on error
        setTotalVotes(prev => (prev ?? 1) - 1)
        setIsLoading(false)
        setIsVoting(false)
      }
    } catch (error) {
      console.error('Error voting:', error)
      // Revert optimistic update on error
      setTotalVotes(prev => (prev ?? 1) - 1)
      setIsLoading(false)
      setIsVoting(false)
    }
  }

  useEffect(() => {
    fetchNewNumbers()
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 z-0" />

      {/* Vote Distribution Background - overlays gradient */}
      <VoteDistribution />

      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 max-w-2xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Number Voting
          </h1>
          <p className="text-white/80 text-lg">
            Choose your favorite number!
          </p>
          <div className="mt-4 text-white/60">
            Total votes cast: <span className="font-semibold">{totalVotes ?? '...'}</span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isLoading ? (
            <motion.div
              key={`${numbers.number1}-${numbers.number2}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row gap-6 justify-center items-center"
            >
              <motion.button
                onClick={() => handleVote(numbers.number1)}
                disabled={isVoting}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-8 md:p-12 transition-all duration-300 border border-white/30 hover:border-white/50 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
              >
                <motion.div
                  className="text-6xl md:text-8xl font-bold text-white mb-2"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {numbers.number1}
                </motion.div>
                <div className="text-white/70 text-sm font-medium uppercase tracking-wider">
                  Click to Vote
                </div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  layoutId="hover-bg-1"
                />
              </motion.button>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/60 text-2xl font-light"
              >
                vs
              </motion.div>

              <motion.button
                onClick={() => handleVote(numbers.number2)}
                disabled={isVoting}
                whileHover={{ scale: 1.05, rotateY: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-8 md:p-12 transition-all duration-300 border border-white/30 hover:border-white/50 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
              >
                <motion.div
                  className="text-6xl md:text-8xl font-bold text-white mb-2"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {numbers.number2}
                </motion.div>
                <div className="text-white/70 text-sm font-medium uppercase tracking-wider">
                  Click to Vote
                </div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  layoutId="hover-bg-2"
                />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center items-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center mt-8 text-white/60 text-sm"
        >
          New numbers appear after each vote
        </motion.div>
      </div>
    </div>
  )
}