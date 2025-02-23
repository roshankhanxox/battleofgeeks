"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

type Player = {
  wallet_address: string
  total_score: number
}

const genres = ["Harry Potter", "Lord of the Rings", "Marvel"]

export default function LeaderboardPage() {
  const [leaderboards, setLeaderboards] = useState<Record<string, Player[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboards() {
      const results: Record<string, Player[]> = {}
      for (const genre of genres) {
        try {
          const response = await fetch(`https://djangodatabase-production.up.railway.app/api/leaderboard/${genre}/`)
          const data = await response.json()
          results[genre] = data.length ? data : []
          console.log(`Fetched leaderboard for ${genre}:`, data)
        } catch (error) {
          console.error(`Error fetching leaderboard for ${genre}:`, error)
          results[genre] = []
        }
      }
      setLeaderboards(results)
      setLoading(false)
    }

    fetchLeaderboards()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          🏆 Realm Rankings 🏆
        </h1>

        {loading ? (
          <p className="text-lg">Loading leaderboards...</p>
        ) : (
          <div className="w-full max-w-4xl mx-auto space-y-8">
            {genres.map((genre) => (
              <motion.div
                key={genre}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 backdrop-blur-sm bg-purple-800/50 rounded-2xl shadow-2xl"
              >
                <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                  {genre} Leaderboard
                </h2>
                <div className="h-px bg-gradient-to-r from-purple-500 to-blue-500 mb-4" />
                {leaderboards[genre]?.length ? (
                  <ul className="space-y-3">
                    {leaderboards[genre].map((player, index) => (
                      <motion.li
                        key={`${player.wallet_address}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-purple-900/30 backdrop-blur-sm rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl font-bold text-purple-300">{index + 1}.</span>
                            <span className="font-medium">{player.wallet_address}</span>
                          </div>
                          <span className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                            {player.total_score} pts
                          </span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-400 py-4">No adventurers have conquered this realm yet.</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

