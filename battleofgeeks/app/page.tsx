"use client"

import { motion } from "framer-motion"
import { Scroll, Trophy, Sword, Coins, Users, Shield } from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Scroll,
    title: "Epic Quizzes",
    description: "Test your knowledge across legendary franchises",
  },
  {
    icon: Coins,
    title: "Token Rewards",
    description: "Earn tokens for your wisdom and expertise",
  },
  {
    icon: Sword,
    title: "Battle for Glory",
    description: "Compete in knowledge battles against other players",
  },
  {
    icon: Trophy,
    title: "Leaderboards",
    description: "Rise through the ranks and claim your place among legends",
  },
  {
    icon: Users,
    title: "Community",
    description: "Join a thriving community of fellow enthusiasts",
  },
  {
    icon: Shield,
    title: "Secure Betting",
    description: "Place secure bets on your quiz performance",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Welcome to CryptoQuest
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Embark on an epic journey through knowledge, where wisdom meets rewards in the realm of blockchain gaming.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={item}
                className="p-6 backdrop-blur-sm bg-purple-800/30 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-colors"
              >
                <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <Link
            href="/quiz"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg transition-colors"
          >
            <Sword className="w-5 h-5" />
            <span>Begin Your Quest</span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}



// import { ConnectButton } from '@rainbow-me/rainbowkit';

// function Page() {
//   return (
//     <div
//       style={{
//         display: 'flex',
//         justifyContent: 'flex-end',
//         padding: 12,
//       }}
//     >
//       <ConnectButton />
//     </div>
//   );
// }

// export default Page;
