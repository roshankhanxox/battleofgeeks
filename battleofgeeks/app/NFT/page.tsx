"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAccount, useWriteContract, useReadContract } from "wagmi"
import { waitForTransactionReceipt } from "@wagmi/core"
import { tokenAbi, tokenAddress, NFTAbi, NFTAddress } from "../abi"
import { config } from "../wagmi"

interface NFTMetadata {
  image: string
  description: string
}

export default function NFT() {
  const { address, isConnected } = useAccount()
  const [nftBalance, setNftBalance] = useState(0)
  const [selectedGenre, setSelectedGenre] = useState("")
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { data: balanceOf } = useReadContract({
    address: NFTAddress,
    abi: NFTAbi,
    functionName: "balanceOf",
    args: [address],
  })

  const { writeContractAsync } = useWriteContract()

  useEffect(() => {
    if (balanceOf) {
      setNftBalance(Number(balanceOf))
    }
  }, [balanceOf])

  useEffect(() => {
    if (nftBalance > 0) {
      fetchNFTMetadata()
    }
  }, [nftBalance])

  const fetchNFTMetadata = async () => {
    if (!address) return

    try {
      const response = await fetch(
        `https://djangodatabase-production.up.railway.app/api/retrieve-wallet-metadata/${address}/`,
      )
      const data = await response.json()
      setNftMetadata({
        image: data.image,
        description: data.description,
      })
    } catch (error) {
      console.error("Error fetching NFT metadata:", error)
    }
  }

  const mint = async () => {
    if (!isConnected || nftBalance > 0 || !address) return

    setIsLoading(true)
    try {
      // Step 1: Get quiz result and image URL
      const quizResponse = await fetch("https://djangodatabase-production.up.railway.app/api/attempt-quiz/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: address,
          genre: selectedGenre,
        }),
      })
      const quizData = await quizResponse.json()

      // Step 2: Store metadata
      await fetch("https://djangodatabase-production.up.railway.app/api/store-wallet-metadata/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: address,
          metadata: {
            image: quizData.image_url,
            description: quizData.prompt,
          },
        }),
      })

      // Step 3: Approve token spend
      const approveHash = await writeContractAsync({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: "approve",
        args: [NFTAddress, BigInt(75e18)],
      })
      await waitForTransactionReceipt(config, { hash: approveHash })

      // Step 4: Mint NFT with the metadata URI
      const uri = `https://djangodatabase-production.up.railway.app/api/retrieve-wallet-metadata/${address}/`
      const mintHash = await writeContractAsync({
        address: NFTAddress,
        abi: NFTAbi,
        functionName: "safeMint",
        args: [address, uri],
      })
      await waitForTransactionReceipt(config, { hash: mintHash })

      // Refresh NFT balance and metadata
      setNftBalance(1)
      await fetchNFTMetadata()
    } catch (error) {
      console.error("Error minting NFT:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const evolve = async () => {
    if (!isConnected || !address) return

    setIsLoading(true)
    try {
      // Step 1: Approve token spend
      const approveHash = await writeContractAsync({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: "approve",
        args: [NFTAddress, BigInt(75e18)],
      })
      await waitForTransactionReceipt(config, { hash: approveHash })

      // Step 2: Call evolve function
      const evolveHash = await writeContractAsync({
        address: NFTAddress,
        abi: NFTAbi,
        functionName: "evolve",
        args: [],
      })
      await waitForTransactionReceipt(config, { hash: evolveHash })

      // Step 3: Get new quiz result
      const quizResponse = await fetch("https://djangodatabase-production.up.railway.app/api/attempt-quiz/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: address,
          genre: selectedGenre || "Harry Potter",
        }),
      })
      const quizData = await quizResponse.json()
      console.log("quizData:", quizData)

      const body = JSON.stringify({
        wallet_address: address,
        
      })

      console.log("body:", body)
      // Step 4: Store new metadata
      await fetch("https://djangodatabase-production.up.railway.app/api/store-wallet-metadata/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: address,
          metadata: {
            image: quizData.image_url,
            description: quizData.prompt,
          },
        }),
      })

      // Step 5: Fetch and display new NFT metadata
      await fetchNFTMetadata()
    } catch (error) {
      console.error("Error evolving NFT:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="p-8 bg-white rounded-lg shadow-xl">
        <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">NFT Minting and Evolution</h1>

        {nftBalance === 0 ? (
          <>
            <div className="mb-4">
              <label htmlFor="genre" className="block mb-2 text-sm font-medium text-gray-700">
                Select Genre
              </label>
              <select
                id="genre"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="">Select a genre</option>
                <option value="Harry Potter">Harry Potter</option>
                <option value="Lord of the Rings">Lord of the Rings</option>
                <option value="Marvel">Marvel</option>
              </select>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={mint}
              disabled={!isConnected || isLoading || !selectedGenre}
              className="w-full px-4 py-2 font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 disabled:opacity-50"
            >
              {isLoading ? "Minting..." : "Mint NFT"}
            </motion.button>
          </>
        ) : (
          <>
            {nftMetadata && (
              <div className="mb-4 text-center">
                <img
                  src={nftMetadata.image || "/placeholder.svg"}
                  alt="NFT"
                  className="mx-auto mb-2 rounded-md w-60 h-60"
                />
                <p className="text-sm text-gray-600">{nftMetadata.description}</p>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={evolve}
              disabled={isLoading}
              className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 disabled:opacity-50"
            >
              {isLoading ? "Evolving..." : "Evolve NFT"}
            </motion.button>
          </>
        )}
      </div>
    </div>
  )
}





// "use client"

// import { useState, useEffect } from "react"
// import { motion } from "framer-motion"
// import { useAccount, useWriteContract, useReadContract } from "wagmi"
// import { waitForTransactionReceipt } from "@wagmi/core"
// import { tokenAbi, tokenAddress, NFTAbi, NFTAddress } from "../abi"
// import { config } from "../wagmi"

// interface NFTMetadata {
//   image: string
//   description: string
// }

// export default function NFT() {
//   const { address, isConnected } = useAccount()
//   const [nftBalance, setNftBalance] = useState(0)
//   const [selectedGenre, setSelectedGenre] = useState("")
//   const [nftMetadata, setNftMetadata] = useState<NFTMetadata | null>(null)
//   const [isLoading, setIsLoading] = useState(false)

//   const { data: balanceOf } = useReadContract({
//     address: NFTAddress,
//     abi: NFTAbi,
//     functionName: "balanceOf",
//     args: [address],
//   })

//   const { writeContractAsync } = useWriteContract()

//   useEffect(() => {
//     if (balanceOf) {
//       setNftBalance(Number(balanceOf))
//     }
//   }, [balanceOf])

//   useEffect(() => {
//     if (nftBalance > 0) {
//       fetchNFTMetadata()
//     }
//   }, [nftBalance])

//   const fetchNFTMetadata = async () => {
//     if (!address) return

//     try {
//       const response = await fetch(
//         `https://djangodatabase-production.up.railway.app/api/retrieve-wallet-metadata/${address}/`,
//       )
//       const data = await response.json()
//       setNftMetadata({
//         image: data.image,
//         description: data.description,
//       })
//     } catch (error) {
//       console.error("Error fetching NFT metadata:", error)
//     }
//   }

//   const mint = async () => {
//     if (!isConnected || nftBalance > 0 || !address) return

//     setIsLoading(true)
//     try {
//       // Step 1: Get quiz result and image URL
//       const quizResponse = await fetch("https://djangodatabase-production.up.railway.app/api/attempt-quiz/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           wallet_address: address,
//           genre: selectedGenre,
//         }),
//       })
//       const quizData = await quizResponse.json()

//       // Step 2: Store metadata
//       await fetch("https://djangodatabase-production.up.railway.app/api/store-wallet-metadata/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           wallet_address: address,
//           metadata: {
//             image: quizData.image_url,
//             description: quizData.prompt,
//           },
//         }),
//       })

//       // Step 3: Approve token spend
//       const approveHash = await writeContractAsync({
//         address: tokenAddress,
//         abi: tokenAbi,
//         functionName: "approve",
//         args: [NFTAddress, BigInt(75e18)],
//       })
//       await waitForTransactionReceipt(config, { hash: approveHash })

//       // Step 4: Mint NFT with the metadata URI
//       const uri = `https://djangodatabase-production.up.railway.app/api/retrieve-wallet-metadata/${address}/`
//       const mintHash = await writeContractAsync({
//         address: NFTAddress,
//         abi: NFTAbi,
//         functionName: "safeMint",
//         args: [address, uri],
//       })
//       await waitForTransactionReceipt(config, { hash: mintHash })

//       // Refresh NFT balance and metadata
//       setNftBalance(1)
//       await fetchNFTMetadata()
//     } catch (error) {
//       console.error("Error minting NFT:", error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const evolve = async () => {
//     console.log("Evolve functionality to be implemented")
//   }

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
//       <div className="p-8 bg-white rounded-lg shadow-xl">
//         <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">NFT Minting and Evolution</h1>

//         {nftBalance === 0 ? (
//           <>
//             <div className="mb-4">
//               <label htmlFor="genre" className="block mb-2 text-sm font-medium text-gray-700">
//                 Select Genre
//               </label>
//               <select
//                 id="genre"
//                 value={selectedGenre}
//                 onChange={(e) => setSelectedGenre(e.target.value)}
//                 className="w-full px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
//               >
//                 <option value="">Select a genre</option>
//                 <option value="Harry Potter">Harry Potter</option>
//                 <option value="Lord of the Rings">Lord of the Rings</option>
//                 <option value="Marvel">Mystery</option>
//               </select>
//             </div>
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={mint}
//               disabled={!isConnected || isLoading || !selectedGenre}
//               className="w-full px-4 py-2 font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 disabled:opacity-50"
//             >
//               {isLoading ? "Minting..." : "Mint NFT"}
//             </motion.button>
//           </>
//         ) : (
//           <>
//             {nftMetadata && (
//               <div className="mb-4 text-center">
//                 <img
//                   src={nftMetadata.image || "/placeholder.svg"}
//                   alt="NFT"
//                   className="mx-auto mb-2 rounded-md w-60 h-60"
//                 />
//                 <p className="text-sm text-gray-600">{nftMetadata.description}</p>
//               </div>
//             )}
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={evolve}
//               className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50"
//             >
//               Evolve NFT
//             </motion.button>
//           </>
//         )}
//       </div>
//     </div>
//   )
// }

