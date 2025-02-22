"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Shield, Sword, Scroll, Crown } from "lucide-react"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { useAccount, useWriteContract } from "wagmi"
import { tokenAbi, tokenAddress } from "../abi"
import { config } from "../wagmi"
import { waitForTransactionReceipt } from "@wagmi/core"
import { bettingAbi, bettingAddress } from "../abi"

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(apiKey as string)

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
})

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
}

const genres = ["Harry Potter", "Lord of the Rings", "Marvel"]

const levels = {
  1: { name: "Apprentice", icon: Scroll, minXp: 0 },
  2: { name: "Adventurer", icon: Sword, minXp: 100 },
  3: { name: "Hero", icon: Shield, minXp: 300 },
  4: { name: "Legend", icon: Crown, minXp: 600 },
}

export default function QuestMaster() {
  const { address, isConnected } = useAccount()
  const [selectedGenre, setSelectedGenre] = useState("")
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [score, setScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [xp, setXp] = useState(0)
  const [showEffect, setShowEffect] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [isLoadingt, setLoadingt] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { writeContractAsync } = useWriteContract()
  const [betAmount, setBetAmount] = useState(0)
  const [isBetPlaced, setIsBetPlaced] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [isBetting, setIsBetting] = useState(false)
  const [showBetConfirmation, setShowBetConfirmation] = useState(false)
  const [isBettingInProgress, setIsBettingInProgress] = useState(false)
  const [quizReady, setQuizReady] = useState(false)
  const [step, setStep] = useState("selectGenre") // 'selectGenre', 'placeBet', 'startQuiz', 'quiz'

  const currentLevel = Object.entries(levels).reduce((acc, [level, data]) => {
    if (xp >= data.minXp) return Number(level)
    return acc
  }, 1)

  const calculateMaxScore = (questions: any[]) => {
    return questions.reduce((sum, q) => sum + q.difficulty * 2, 0)
  }

  const fetchQuestions = async (genre: string) => {
    setIsLoading(true)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setScore(0)
    setFeedback("")
    setGameComplete(false)
    try {
      const chatSession = model.startChat({
                generationConfig,
                history: [
                  {
                    role: "user",
                    parts: [
                      {
                        text: 'You are a geeky, nerdy AI with an encyclopedic knowledge of Marvel, Harry Potter, Lord of the Rings, Star Wars, and other major fantasy and sci-fi franchises.\nA user will provide a genre (e.g., "Harry Potter") or a specific subcategory (e.g., "Harry Potter: Order of the Phoenix").\nGenerate 5 factual quiz questions based only on the given genre/subcategory, ensuring that each question gets progressively harder.\nEach question should require a short, specific answer (a few words at most).\nReturn the response in JSON format like this:\n{\n  "genre": "Harry Potter: Order of the Phoenix",\n  "questions": [\n    {\n      "question": "What is the name of the secret group Harry forms to train students in Defense Against the Dark Arts?",\n      "answer": "Dumbledore\'s Army",\n      "difficulty": 1\n    },\n    {\n      "question": "Who becomes the Hogwarts High Inquisitor in this book?",\n      "answer": "Dolores Umbridge",\n      "difficulty": 2\n    },\n    {\n      "question": "Which spell does Harry use to defend against the Dementors near Privet Drive?",\n      "answer": "Expecto Patronum",\n      "difficulty": 3\n    },\n    {\n      "question": "What does Hermione use to communicate with the members of Dumbledore’s Army?",\n      "answer": "Enchanted Galleons",\n      "difficulty": 4\n    },\n    {\n      "question": "What is the exact number of prophecies destroyed during the battle at the Department of Mysteries?",\n      "answer": "Nine",\n      "difficulty": 5\n    }\n  ]\n}\nEnsure the difficulty gradually increases, starting with common knowledge and ending with deep lore that only hardcore fans would know.\nThe genre/subcategory should be strictly followed, and the questions should not mix with other parts of the franchise.',
                      },
                    ],
                  },
                  {
                    role: "model",
                    parts: [
                      {
                        text: '⁠  json\n{\n  "genre": "Lord of the Rings: The Fellowship of the Ring",\n  "questions": [\n    {\n      "question": "What is the name of Bilbo Baggins\' home?",\n      "answer": "Bag End",\n      "difficulty": 1\n    },\n    {\n      "question": "Who is the leader of the Fellowship of the Ring?",\n      "answer": "Aragorn",\n      "difficulty": 2\n    },\n    {\n      "question": "What type of creature is Gandalf?",\n      "answer": "Wizard",\n      "difficulty": 3\n    },\n    {\n      "question": "In what Elvish realm does the Fellowship find refuge after fleeing Moria?",\n      "answer": "Lothlórien",\n      "difficulty": 4\n    },\n    {\n      "question": "What gift does Galadriel give to Gimli?",\n      "answer": "Three hairs",\n      "difficulty": 5\n    }\n  ]\n}\n  ⁠',
                      },
                    ],
                  },
                  {
                    role: "user",
                    parts: [{ text: "avengers endgame\n" }],
                  },
                  {
                    role: "model",
                    parts: [
                      {
                        text: '⁠  json\n{\n  "genre": "Avengers Endgame",\n  "questions": [\n    {\n      "question": "What is the name of Thanos\' homeworld?",\n      "answer": "Titan",\n      "difficulty": 1\n    },\n    {\n      "question": "What is the name of the rat that accidentally frees Ant-Man from the Quantum Realm?",\n      "answer": "Mr. Whiskers",\n      "difficulty": 2\n    },\n    {\n      "question": "Which Infinity Stone does the Soul Stone require as a sacrifice?",\n      "answer": "A soul",\n      "difficulty": 3\n    },\n    {\n      "question": "What song does Tony Stark call \\"a Christmas jam\\" when he is stranded in space?",\n      "answer": "So Long Partner",\n      "difficulty": 4\n    },\n    {\n      "question": "What year does Steve Rogers return to in order to live his life with Peggy Carter?",\n      "answer": "1949",\n      "difficulty": 5\n    }\n  ]\n}\n  ⁠',
                      },
                    ],
                  },
                ],
              })
const result = await chatSession.sendMessage(genre)
const response = result.response.text()
const cleanedResponse = response.replace(/```json|```/g, "").trim()

try {
  const parsedResponse = JSON.parse(cleanedResponse)
  console.log("Parsed response:", parsedResponse)
  if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
    setQuestions(parsedResponse.questions)
    setMaxScore(calculateMaxScore(parsedResponse.questions))
    setStep("startQuiz") // Move to the start quiz step after fetching questions
  }
} catch (error) {
  console.error("Failed to parse JSON:", error)
  setFeedback("A mysterious force prevented the questions from appearing. Try again!")
}
} catch (error)
{
  console.error("Error:", error)
  setFeedback("The ancient scrolls are temporarily unavailable. Try again soon!")
}
finally
{
  setIsLoading(false)
}
}

const handleGenreSelect = (genre: string) => {
  setSelectedGenre(genre)
  setShowDropdown(false)
  setStep("placeBet")
}

const handleSubmitAnswer = () => {
  const currentQuestion = questions[currentQuestionIndex]
  const isCorrect = userAnswer.toLowerCase() === currentQuestion.answer.toLowerCase()

  if (isCorrect) {
    const pointsGained = currentQuestion.difficulty * 2
    const xpGained = currentQuestion.difficulty * 20
    setScore((prev) => prev + pointsGained)
    setXp((prev) => prev + xpGained)
    setFeedback(`✨ Correct! +${pointsGained} points, +${xpGained} XP!`)
    setShowEffect(true)
  } else {
    setFeedback(`❌ The correct answer was: ${currentQuestion.answer}`)
  }

  setTimeout(() => {
    setShowEffect(false)
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setUserAnswer("")
      setFeedback("")
    } else {
      setGameComplete(true)
    }
  }, 2000)
}

const getScoreColor = () => {
  const percentage = (score / maxScore) * 100
  if (percentage >= 80) return "text-green-400"
  if (percentage >= 60) return "text-yellow-400"
  if (percentage >= 40) return "text-orange-400"
  return "text-red-400"
}

const handleApprove = async () => {
  if (!betAmount || betAmount <= 0) return

  setIsBettingInProgress(true)
  setLoadingt(true)
  setError("")
  setSuccess("")

  try {
    const args = [bettingAddress, betAmount]
    console.log("Approving tokens for bet with args:", args)

    const receipt = await writeContractAsync({
      address: tokenAddress,
      abi: tokenAbi,
      functionName: "approve",
      args,
    })

    await waitForTransactionReceipt(config, { hash: receipt })
    console.log("Approval transaction receipt:", receipt)
    setSuccess("🎉 Tokens approved successfully!")
    setIsApproved(true)
  } catch (error: any) {
    console.error("Approval error:", error)
    setError("Failed to approve tokens: " + (error.message || "Unknown error"))
    setIsBettingInProgress(false)
  } finally {
    setLoadingt(false)
  }
}

const handlePlaceBet = async () => {
  if (!betAmount || betAmount <= 0 || !isApproved) return

  setIsBetting(true)
  setError("")
  setSuccess("")

  try {
    const args = [betAmount, selectedGenre]
    console.log("Placing bet with args:", args)

    const receipt = await writeContractAsync({
      address: bettingAddress,
      abi: bettingAbi,
      functionName: "placeBet",
      args,
    })

    await waitForTransactionReceipt(config, { hash: receipt })
    console.log("Bet transaction receipt:", receipt)
    setSuccess("🎉 Bet placed successfully!")
    setIsBetPlaced(true)
    setIsBettingInProgress(false)
    fetchQuestions(selectedGenre)
  } catch (error: any) {
    console.error("Bet error:", error)
    setError("Failed to place bet: " + (error.message || "Unknown error"))
    setIsBettingInProgress(false)
  } finally {
    setLoadingt(false)
  }
}

const handleStartQuiz = () => {
  if (betAmount > 0 && !isApproved) {
    handleApprove()
  } else if (betAmount > 0 && isApproved && !isBetPlaced) {
    handlePlaceBet()
  } else {
    fetchQuestions(selectedGenre)
  }
}

const startQuiz = () => {
  setStep("quiz")
}

const checkLeaderboardPosition = async () => {
  try {
    const response = await fetch(`https://djangodatabase-production.up.railway.app/api/leaderboard/${selectedGenre}/`)
    const data = await response.json()

    // Find our position and determine result
    const sortedData = [...data].sort((a, b) => b.total_score - a.total_score)
    const ourPosition = sortedData.findIndex((entry) => entry.wallet_address === address)

    if (ourPosition === 0) {
      return "success"
    } else if (ourPosition === 1 && sortedData[0].total_score === sortedData[1].total_score) {
      return "tie"
    } else {
      return "failure"
    }
  } catch (error) {
    console.error("Error checking leaderboard:", error)
    return "failure"
  }
}

const finalizeBet = async (result: string) => {
  setLoadingt(true)
  setError("")
  setSuccess("")

  try {
    const receipt = await writeContractAsync({
      address: bettingAddress,
      abi: bettingAbi,
      functionName: "finalizeBet", // Fixed function name
      args: [address, selectedGenre, result],
    })

    const txt = await waitForTransactionReceipt(config, { hash: receipt })
    console.log("Finalize bet transaction:", txt)
    setSuccess("🎉 Bet finalized successfully!")
  } catch (error: any) {
    console.error("Finalize bet error:", error)
    setError("Failed to finalize bet: " + (error.message || "Unknown error"))
  } finally {
    setLoadingt(false)
  }
}

const handleMinttokens = async () => {
  if (score <= 0) {
    setError("Score must be greater than 0 to mint tokens")
    return
  }

  setLoadingt(true)
  setError("")
  setSuccess("")

  try {
    // Mint tokens
    const mintReceipt = await writeContractAsync({
      address: tokenAddress,
      abi: tokenAbi,
      functionName: "mint",
      args: [address, score],
    })
    await waitForTransactionReceipt(config, { hash: mintReceipt })

    // Update leaderboard
    await fetch("https://djangodatabase-production.up.railway.app/api/leaderboard/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet_address: address,
        genre: selectedGenre,
        score: score,
      }),
    })

    // If there was a bet, check position and finalize
    if (isBetPlaced) {
      const result = await checkLeaderboardPosition()
      const finalizeReceipt = await writeContractAsync({
        address: bettingAddress,
        abi: bettingAbi,
        functionName: "finalizeBet",
        args: [address, selectedGenre, result],
      })
      await waitForTransactionReceipt(config, { hash: finalizeReceipt })
      setSuccess(`🎉 Tokens minted and bet finalized! Result: ${result}`)
    } else {
      setSuccess("🎉 Tokens minted successfully!")
    }
  } catch (error: any) {
    console.error("Error:", error)
    setError("Transaction failed: " + (error.message || "Unknown error"))
  } finally {
    setLoadingt(false)
  }
}

console.log("questions:", questions)

return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {step === 'selectGenre' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Choose Your Quest</h2>
            <div className="flex justify-center space-x-4">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreSelect(genre)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medieval"
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'placeBet' && (
          <div className="mt-4 p-6 bg-purple-800/50 backdrop-blur-sm rounded-lg">
            <h3 className="text-xl font-bold mb-4">Place Your Bet (Optional)</h3>
            <div className="flex gap-4 mb-4">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                min="0"
                placeholder="Enter bet amount..."
                className="flex-1 bg-purple-900/50 border border-purple-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isBettingInProgress}
              />
            </div>
            <button
              onClick={handleStartQuiz}
              disabled={isBettingInProgress || isLoadingt}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {isBettingInProgress
                ? isApproved
                  ? "Placing Bet..."
                  : "Approving Tokens..."
                : betAmount > 0
                ? "Place Bet and Prepare Quiz"
                : "Prepare Quiz Without Betting"}
            </button>
          </div>
        )}

        {step === 'startQuiz' && (
          <div className="mt-4 p-6 bg-purple-800/50 backdrop-blur-sm rounded-lg text-center">
            <h3 className="text-xl font-bold mb-4">
              {betAmount > 0 ? "Bet Placed Successfully!" : "Quiz Prepared!"}
            </h3>
            <p className="mb-4">Are you ready to start the quiz?</p>
            <button
              onClick={startQuiz}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Start Quiz
            </button>
          </div>
        )}

        {step === 'quiz' && (
          <>
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-2">
                {Object.entries(levels).map(([level, data]) => {
                  const LevelIcon = data.icon
                  return (
                    <div
                      key={level}
                      className={`flex items-center space-x-2 ${
                        currentLevel >= Number(level) ? "text-yellow-400" : "text-gray-600"
                      }`}
                    >
                      <LevelIcon className="w-6 h-6" />
                      <span>{data.name}</span>
                    </div>
                  )
                })}
              </div>
              <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${xp % 100}%` }}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="inline-block"
                >
                  <Scroll className="w-12 h-12" />
                </motion.div>
                <p className="mt-4">Consulting the ancient scrolls...</p>
              </div>
            ) : questions.length > 0 && !gameComplete ? (
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                {showEffect && (
                  <motion.div
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Star className="w-32 h-32 text-yellow-400" />
                  </motion.div>
                )}

                <div className="bg-purple-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
                  <h2 className="text-2xl font-bold mb-4">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </h2>
                  <p className="text-xl mb-6">{questions[currentQuestionIndex].question}</p>
                  <div className="flex items-center mb-4">
                    <span className="mr-2">Difficulty:</span>
                    {[...Array(questions[currentQuestionIndex].difficulty)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400" />
                    ))}
                    <span className="ml-2">({questions[currentQuestionIndex].difficulty * 2} points)</span>
                  </div>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSubmitAnswer()
                      }
                    }}
                    placeholder="Enter your answer..."
                    className="w-full bg-purple-900/50 border border-purple-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                  />
                  <button
                    onClick={handleSubmitAnswer}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Submit Answer
                  </button>
                </div>

                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-4 rounded-lg text-center font-bold ${
                      feedback.includes("Correct") ? "bg-green-500/20" : "bg-red-500/20"
                    }`}
                  >
                    {feedback}
                  </motion.div>
                )}
              </motion.div>
            ) : gameComplete ? (
              <div className="text-center bg-purple-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
                <h2 className="text-3xl font-bold mb-4">Quest Complete!</h2>
                <p className="text-xl mb-4">
                  Final Score: <span className={getScoreColor()}>{score}</span> out of {maxScore}
                </p>
                <p className="text-lg mb-6">
                  {score === maxScore
                    ? "Perfect score! You are truly a master of knowledge!"
                    : score >= maxScore * 0.8
                      ? "Excellent work! Your wisdom is impressive!"
                      : score >= maxScore * 0.6
                        ? "Well done! Keep studying to improve further!"
                        : "There's room for improvement. Try again!"}
                </p>
                <button
                  onClick={() => fetchQuestions(selectedGenre)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Try Again
                </button>
                {gameComplete && score > 0 && (
                  <button
                    onClick={handleMinttokens}
                    disabled={isLoadingt}
                    className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoadingt ? "Minting..." : "Mint Achievement Tokens"}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center text-xl">{feedback || "Choose a quest to begin your adventure!"}</div>
            )}
          </>
        )}

        {(error || success) && (
          <div className={`mt-4 p-4 rounded-lg text-center ${error ? "bg-red-500/20" : "bg-green-500/20"}`}>
            {error || success}
          </div>
        )}
      </div>
    </div>
  )
}






