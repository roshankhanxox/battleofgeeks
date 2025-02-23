"use client";

import { useEffect, useState } from "react";

type Player = {
  wallet_address: string;
  total_score: number;
};

const genres = ["Harry Potter", "Lord of the Rings", "Marvel"];

export default function LeaderboardPage() {
  const [leaderboards, setLeaderboards] = useState<Record<string, Player[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboards() {
      const results: Record<string, Player[]> = {};
      for (const genre of genres) {
        try {
          const response = await fetch(`https://djangodatabase-production.up.railway.app/api/leaderboard/${genre}/`);
          const data = await response.json();
          results[genre] = data.length ? data : [];
          console.log(`Fetched leaderboard for ${genre}:`, data);
        } catch (error) {
          console.error(`Error fetching leaderboard for ${genre}:`, error);
          results[genre] = [];
        }
      }
      setLeaderboards(results);
      setLoading(false);
    }

    fetchLeaderboards();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">🏆 Leaderboards 🏆</h1>

      {loading ? (
        <p className="text-lg">Loading leaderboards...</p>
      ) : (
        <div className="w-full max-w-3xl">
          {genres.map((genre) => (
            <div key={genre} className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-lg">
              <h2 className="text-xl font-semibold text-center">{genre} Leaderboard</h2>
              <hr className="my-2 border-gray-600" />
              {leaderboards[genre]?.length ? (
                <ul>
                  {leaderboards[genre].map((player, index) => (
                    <li key={`${player.wallet_address}-${index}`} className="p-2 border-b border-gray-700">
                      <div className="flex justify-between">
                        <span className="font-medium">{index + 1}. {player.wallet_address}</span>
                        <span className="text-yellow-400">{player.total_score} pts</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-center mt-2">No leaderboard available.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
