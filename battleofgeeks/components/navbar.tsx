"use client"

import Link from "next/link"
import '@rainbow-me/rainbowkit/styles.css';
import { usePathname } from "next/navigation"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { motion } from "framer-motion"
import { Scroll, Trophy, Swords,Image } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Quest Hub", icon: Swords },
    { href: "/quiz", label: "Quiz", icon: Scroll },
    { href: "/leaderboards", label: "Leaderboard", icon: Trophy },
    { href: "/NFT", label: "NFT", icon: Image },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-purple-900/30 border-b border-purple-500/20">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
            >
              BattleOfGeeks
            </Link>
            <div className="hidden md:flex md:space-x-4">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 rounded-lg transition-colors ${
                      isActive ? "text-purple-300" : "text-gray-300 hover:text-purple-300 hover:bg-purple-800/30"
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== "loading"
              const connected =
                ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated")

              return (
                <div
                  {...(!ready && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold transition-colors"
                        >
                          Connect Wallet
                        </button>
                      )
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
                        >
                          Wrong network
                        </button>
                      )
                    }

                    return (
                      <div className="flex items-center gap-4">
                        <button
                          onClick={openChainModal}
                          className="px-4 py-2 rounded-lg bg-purple-800/50 hover:bg-purple-800/70 transition-colors flex items-center gap-2"
                        >
                          {chain.hasIcon && (
                            <div className="w-5 h-5">
                              {chain.iconUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  alt={chain.name ?? "Chain icon"}
                                  src={chain.iconUrl || "/placeholder.svg"}
                                  className="w-5 h-5"
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </button>

                        <button
                          onClick={openAccountModal}
                          className="px-4 py-2 rounded-lg bg-purple-800/50 hover:bg-purple-800/70 transition-colors"
                        >
                          {account.displayName}
                        </button>
                      </div>
                    )
                  })()}
                </div>
              )
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </nav>
  )
}