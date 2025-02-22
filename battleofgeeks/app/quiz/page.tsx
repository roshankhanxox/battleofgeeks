"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { GoogleGenerativeAI } from "@google/generative-ai"

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

export default function QuizPage() {
  const [selectedGenre, setSelectedGenre] = useState("")
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState("")

  useEffect(() => {
    if (selectedGenre) {
      fetchQuestions(selectedGenre)
    }
  }, [selectedGenre])

  const fetchQuestions = async (genre: string) => {
    setIsLoading(true)
    setQuestions([]) // Clear previous questions
    setCurrentQuestionIndex(0)
    setScore(0) // Reset score when changing genre
    setFeedback("") // Clear any previous feedback
    try {
      const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [
              {
                text: "You are a geeky AI that generates progressively harder quiz questions about movies, books, and fantasy/sci-fi franchises based on the given genre. Format response as JSON with a 'questions' array containing objects with 'id', 'difficulty', 'question', and 'answer' fields.",
              },
            ],
          },
          {
            role: "model",
            parts: [
              {
                text: "Understood. I'll generate 5 factual quiz questions with increasing difficulty for the given genre, formatted as JSON with the specified structure.",
              },
            ],
          },
        ],
      })

      const result = await chatSession.sendMessage(genre)
      const response = result.response.text()
      const cleanedResponse = response.replace(/```json|```/g, "").trim()
      console.log("Cleaned response:", cleanedResponse)

      try {
        const parsedResponse = JSON.parse(cleanedResponse)
        if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
          setQuestions(parsedResponse.questions)
          console.log("Parsed questions:", parsedResponse.questions)
        } else {
          console.error("Invalid response structure:", parsedResponse)
          setFeedback("Error: Unable to load questions. Please try again.")
        }
      } catch (error) {
        console.error("Failed to parse JSON:", error)
        setFeedback("Error: Unable to load questions. Please try again.")
      }
    } catch (error) {
      console.error("Error:", error)
      setFeedback("Error: Unable to load questions. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = userAnswer.toLowerCase() === currentQuestion.answer.toLowerCase()

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1)
      setFeedback("Correct!")
    } else {
      setFeedback(`Incorrect. The correct answer is: ${currentQuestion.answer}`)
    }

    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1)
        setUserAnswer("")
        setFeedback("")
      }, 2000)
    } else {
      setFeedback(`Quiz completed! Your final score is: ${score + (isCorrect ? 1 : 0)} out of ${questions.length}`)
    }
  }

  console.log("Questions:", questions)

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 p-4">
        <div className="relative inline-block text-left">
          <div>
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
              id="options-menu"
              aria-haspopup="true"
              aria-expanded="true"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {selectedGenre || "Select Genre"}
              <ChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5"
              >
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  {genres.map((genre) => (
                    <a
                      key={genre}
                      href="#"
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-600"
                      role="menuitem"
                      onClick={() => {
                        setSelectedGenre(genre)
                        setShowDropdown(false)
                      }}
                    >
                      {genre}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <main className="flex-grow p-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold mb-4"
        >
          {selectedGenre ? `${selectedGenre} Quiz` : "Select a Genre to Start"}
        </motion.h1>

        {isLoading ? (
          <div className="text-gray-400">Loading questions...</div>
        ) : questions && questions.length > 0 ? (
          <div className="space-y-4">
            <p className="text-lg font-semibold mb-4">Score: {score}</p>
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-gray-800 p-4 rounded-lg"
            >
              <h2 className="text-xl font-semibold mb-2">
                Question {currentQuestionIndex + 1}: {questions[currentQuestionIndex]?.question}
              </h2>
              <p className="text-sm text-gray-400 mb-2">Difficulty: {questions[currentQuestionIndex]?.difficulty}</p>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Your answer..."
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSubmitAnswer}
                className="mt-2 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
              >
                Submit Answer
              </button>
            </motion.div>
            {feedback && (
              <p className={`mt-2 ${feedback.includes("Correct") ? "text-green-500" : "text-red-500"}`}>{feedback}</p>
            )}
          </div>
        ) : (
          <div className="text-gray-400">{feedback || "No questions available. Select a genre to start the quiz."}</div>
        )}
      </main>
    </div>
  )
}





// "use client"

// import { useState, useEffect } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { ChevronDown } from "lucide-react"
// import { GoogleGenerativeAI } from "@google/generative-ai"

// const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
// const genAI = new GoogleGenerativeAI(apiKey as string)

// const model = genAI.getGenerativeModel({
//   model: "gemini-2.0-flash-exp",
// })

// const generationConfig = {
//   temperature: 1,
//   topP: 0.95,
//   topK: 40,
//   maxOutputTokens: 8192,
// }

// const genres = ["Harry Potter", "Lord of the Rings", "Marvel"]

// export default function QuizPage() {
//   const [selectedGenre, setSelectedGenre] = useState("")
//   const [questions, setQuestions] = useState<any[]>([])
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
//   const [userAnswer, setUserAnswer] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [showDropdown, setShowDropdown] = useState(false)
//   const [score, setScore] = useState(0)
//   const [feedback, setFeedback] = useState("")

//   useEffect(() => {
//     if (selectedGenre) {
//       fetchQuestions(selectedGenre)
//     }
//   }, [selectedGenre])

//   const fetchQuestions = async (genre: string) => {
//     setIsLoading(true)
//     try {
//       const chatSession = model.startChat({
//         generationConfig,
//         history: [
//           {
//             role: "user",
//             parts: [
//               {
//                 text: "You are a geeky AI that generates progressively harder quiz questions about movies, books, and fantasy/sci-fi franchises based on the given genre. Format response as JSON.",
//               },
//             ],
//           },
//           {
//             role: "model",
//             parts: [
//               {
//                 text: "Understood. I'll generate 5 factual quiz questions with increasing difficulty for the given genre, formatted as JSON.",
//               },
//             ],
//           },
//         ],
//       })

//       const result = await chatSession.sendMessage(genre)
//       const response = result.response.text()
//       const cleanedResponse = response.replace(/```json|```/g, "").trim() // Remove backticks & trim
//       console.log("Cleaned response:", cleanedResponse)
//       try {
//         const parsedResponse = JSON.parse(cleanedResponse)
//         setQuestions(parsedResponse.questions)
//       } catch (error) {
//         console.error("Failed to parse JSON:", error)
//       }

//       setCurrentQuestionIndex(0)
//     } catch (error) {
//       console.error("Error:", error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleSubmitAnswer = () => {
//     const currentQuestion = questions[currentQuestionIndex]
//     const isCorrect = userAnswer.toLowerCase() === currentQuestion.answer.toLowerCase()

//     if (isCorrect) {
//       setScore((prevScore) => prevScore + 1)
//       setFeedback("Correct!")
//     } else {
//       setFeedback(`Incorrect. The correct answer is: ${currentQuestion.answer}`)
//     }

//     if (currentQuestionIndex < questions.length - 1) {
//       setTimeout(() => {
//         setCurrentQuestionIndex((prev) => prev + 1)
//         setUserAnswer("")
//         setFeedback("")
//       }, 2000)
//     } else {
//       setFeedback(`Quiz completed! Your final score is: ${score + (isCorrect ? 1 : 0)} out of ${questions.length}`)
//     }
//   }

//   console.log("Questions:", questions)

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-900 text-white">
//       <nav className="bg-gray-800 p-4">
//         <div className="relative inline-block text-left">
//           <div>
//             <button
//               type="button"
//               className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
//               id="options-menu"
//               aria-haspopup="true"
//               aria-expanded="true"
//               onClick={() => setShowDropdown(!showDropdown)}
//             >
//               {selectedGenre || "Select Genre"}
//               <ChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
//             </button>
//           </div>

//           <AnimatePresence>
//             {showDropdown && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5"
//               >
//                 <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
//                   {genres.map((genre) => (
//                     <a
//                       key={genre}
//                       href="#"
//                       className="block px-4 py-2 text-sm text-white hover:bg-gray-600"
//                       role="menuitem"
//                       onClick={() => {
//                         setSelectedGenre(genre)
//                         setShowDropdown(false)
//                       }}
//                     >
//                       {genre}
//                     </a>
//                   ))}
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </nav>

//       <main className="flex-grow p-6">
//         <motion.h1
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.3 }}
//           className="text-3xl font-bold mb-4"
//         >
//           {selectedGenre ? `${selectedGenre} Quiz` : "Select a Genre to Start"}
//         </motion.h1>

//         {isLoading ? (
//           <div className="text-gray-400">Loading questions...</div>
//         ) : questions && questions.length > 0 ? (
//           <div className="space-y-4">
//             <p className="text-lg font-semibold mb-4">Score: {score}</p>
//             <motion.div
//               key={currentQuestionIndex}
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: 20 }}
//               className="bg-gray-800 p-4 rounded-lg"
//             >
//               <h2 className="text-xl font-semibold mb-2">
//                 Question {currentQuestionIndex + 1}: {questions[currentQuestionIndex].question}
//               </h2>
//               <p className="text-sm text-gray-400 mb-2">Difficulty: {questions[currentQuestionIndex].difficulty}</p>
//               <input
//                 type="text"
//                 value={userAnswer}
//                 onChange={(e) => setUserAnswer(e.target.value)}
//                 placeholder="Your answer..."
//                 className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <button
//                 onClick={handleSubmitAnswer}
//                 className="mt-2 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
//               >
//                 Submit Answer
//               </button>
//             </motion.div>
//             {feedback && (
//               <p className={`mt-2 ${feedback.includes("Correct") ? "text-green-500" : "text-red-500"}`}>{feedback}</p>
//             )}
//           </div>
//         ) : (
//           <div className="text-gray-400">No questions available. Select a genre to start the quiz.</div>
//         )}
//       </main>
//     </div>
//   )
// }










// "use client"

// import { useState, useEffect } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { ChevronDown } from "lucide-react"
// import { GoogleGenerativeAI } from "@google/generative-ai"

// const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
// const genAI = new GoogleGenerativeAI(apiKey as string)

// const model = genAI.getGenerativeModel({
//   model: "gemini-2.0-flash-exp",
// })

// const generationConfig = {
//   temperature: 1,
//   topP: 0.95,
//   topK: 40,
//   maxOutputTokens: 8192,
// }

// const genres = ["Harry Potter", "Lord of the Rings", "Marvel"]

// export default function QuizPage() {
//   const [selectedGenre, setSelectedGenre] = useState("")
//   const [questions, setQuestions] = useState<any[]>([])
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
//   const [userAnswer, setUserAnswer] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [showDropdown, setShowDropdown] = useState(false)

//   useEffect(() => {
//     if (selectedGenre) {
//       fetchQuestions(selectedGenre)
//     }
//   }, [selectedGenre])

//   const fetchQuestions = async (genre: string) => {
//     setIsLoading(true)
//     try {
//       const chatSession = model.startChat({
//         generationConfig,
//         history: [
//           {
//             role: "user",
//             parts: [
//               {
//                 text: "You are a geeky AI that generates progressively harder quiz questions about movies, books, and fantasy/sci-fi franchises based on the given genre. Format response as JSON.",
//               },
//             ],
//           },
//           {
//             role: "model",
//             parts: [
//               {
//                 text: "Understood. I'll generate 5 factual quiz questions with increasing difficulty for the given genre, formatted as JSON.",
//               },
//             ],
//           },
//         ],
//       })

//       const result = await chatSession.sendMessage(genre)
//       const response = result.response.text();
//     const cleanedResponse = response.replace(/```json|```/g, "").trim(); // Remove backticks & trim
//     console.log("Cleaned response:", cleanedResponse);
//     try {
//     const parsedResponse = JSON.parse(cleanedResponse);
//     setQuestions(parsedResponse.questions);
//     } catch (error) {
//     console.error("Failed to parse JSON:", error);
//     }

//       setCurrentQuestionIndex(0)
//     } catch (error) {
//       console.error("Error:", error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleSubmitAnswer = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex((prev) => prev + 1)
//       setUserAnswer("")
//     }
//   }

//   console.log("Questions:", questions);

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-900 text-white">
//       <nav className="bg-gray-800 p-4">
//         <div className="relative inline-block text-left">
//           <div>
//             <button
//               type="button"
//               className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
//               id="options-menu"
//               aria-haspopup="true"
//               aria-expanded="true"
//               onClick={() => setShowDropdown(!showDropdown)}
//             >
//               {selectedGenre || "Select Genre"}
//               <ChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
//             </button>
//           </div>

//           <AnimatePresence>
//             {showDropdown && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5"
//               >
//                 <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
//                   {genres.map((genre) => (
//                     <a
//                       key={genre}
//                       href="#"
//                       className="block px-4 py-2 text-sm text-white hover:bg-gray-600"
//                       role="menuitem"
//                       onClick={() => {
//                         setSelectedGenre(genre)
//                         setShowDropdown(false)
//                       }}
//                     >
//                       {genre}
//                     </a>
//                   ))}
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </nav>

//       <main className="flex-grow p-6">
//         <motion.h1
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.3 }}
//           className="text-3xl font-bold mb-4"
//         >
//           {selectedGenre ? `${selectedGenre} Quiz` : "Select a Genre to Start"}
//         </motion.h1>

//         {isLoading ? (
//           <div className="text-gray-400">Loading questions...</div>
//         ) : questions.length > 0 ? (
//           <div className="space-y-4">
//             <motion.div
//               key={currentQuestionIndex}
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: 20 }}
//               className="bg-gray-800 p-4 rounded-lg"
//             >
//               <h2 className="text-xl font-semibold mb-2">
//                 Question {currentQuestionIndex + 1}: {questions[currentQuestionIndex].question}
//               </h2>
//               <p className="text-sm text-gray-400 mb-2">Difficulty: {questions[currentQuestionIndex].difficulty}</p>
//               <input
//                 type="text"
//                 value={userAnswer}
//                 onChange={(e) => setUserAnswer(e.target.value)}
//                 placeholder="Your answer..."
//                 className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <button
//                 onClick={handleSubmitAnswer}
//                 className="mt-2 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
//               >
//                 Submit Answer
//               </button>
//             </motion.div>
//           </div>
//         ) : (
//           <div className="text-gray-400">No questions available. Select a genre to start the quiz.</div>
//         )}
//       </main>
//     </div>
//   )
// }
