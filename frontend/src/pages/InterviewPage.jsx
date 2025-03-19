"use client"

import { useState, useEffect, useRef, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DashboardLayout from "../components/DashboardLayout"
import CodeEditor from "../components/CodeEditor"
import { AuthContext } from "../contexts/AuthContext"
import api from "../services/api"
// import { initializeWebRTC, joinRoom, leaveRoom } from "../services/webrtc"
import { io } from "socket.io-client"

const InterviewPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isInterviewer } = useContext(AuthContext)
  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [canJoin, setCanJoin] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [availableQuestions, setAvailableQuestions] = useState([])
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [newQuestionText, setNewQuestionText] = useState("")
  const [feedback, setFeedback] = useState({ rating: 0, comments: "" })
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("disconnected")
  const [peers, setPeers] = useState([])
  const [isTyping, setIsTyping] = useState(false)

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const messagesEndRef = useRef(null)
  const webrtcRef = useRef(null)
  const socketRef = useRef(null)
  const codeChangeTimeoutRef = useRef(null)

  useEffect(() => {
    const checkInterviewAccess = async () => {
      try {
        const response = await api.get(`/interviews/${id}/can-join`)
        console.log(response)
        if (response.data.canJoin) {
          setCanJoin(true)
          fetchInterviewDetails()

          // Initialize socket connection
          socketRef.current = io("http://localhost:5000", {
            query: {
              interviewId: id,
              userId: user.id,
              role: isInterviewer ? "interviewer" : "candidate",
            },
          })

          // Listen for code updates from other users
          socketRef.current.on("code_update", (data) => {
            if (data.userId !== user.id) {
              setCode(data.code)
              setLanguage(data.language)
              setIsTyping(true)

              // Clear the typing indicator after 1 second
              setTimeout(() => {
                setIsTyping(false)
              }, 1000)
            }
          })

          // Handle socket connection status
          socketRef.current.on("connect", () => {
            console.log("Socket connected")
          })

          socketRef.current.on("disconnect", () => {
            console.log("Socket disconnected")
          })
        } else {
          setError("You can only join this interview 10 minutes before the scheduled time.")
          setLoading(false)
        }
      } catch (error) {
        console.error("Error checking interview access:", error)
        setError("Failed to check interview access. Please try again later.")
        setLoading(false)
      }
    }

    checkInterviewAccess()

    return () => {
      if (webrtcRef.current) {
        // leaveRoom()
      }

      // Disconnect socket when component unmounts
      if (socketRef.current) {
        socketRef.current.disconnect()
      }

      // Clear any pending timeouts
      if (codeChangeTimeoutRef.current) {
        clearTimeout(codeChangeTimeoutRef.current)
      }
    }
  }, [id, user.id, isInterviewer])

  const fetchInterviewDetails = async () => {
    try {
      const [interviewResponse, messagesResponse, questionsResponse] = await Promise.all([
        api.get(`/interviews/${id}`),
        api.get(`/interviews/${id}/messages`),
        api.get("/coding-questions"),
      ])

      const interviewData = interviewResponse.data.interview
      setInterview(interviewData)
      setMessages(messagesResponse.data.messages || [])
      setAvailableQuestions(questionsResponse.data.questions || [])

      if (interviewData.code) {
        setCode(interviewData.code)
      }

      if (interviewData.code_language) {
        setLanguage(interviewData.code_language)
      }

      if (interviewData.current_question_id && interviewData.current_question) {
        setCurrentQuestion(interviewData.current_question)
      }

      // Check if there's existing feedback
      if (interviewData.feedback) {
        setFeedback({
          rating: interviewData.feedback.rating || 0,
          comments: interviewData.feedback.comments || "",
        })
      }

      // Update interview status if needed
      if (interviewData.status === "scheduled") {
        await api.put(`/interviews/${id}`, { status: "in_progress" })
      }

      setLoading(false)

      // Initialize WebRTC after loading
      // initializeWebRTC({
      //   localVideoRef: localVideoRef.current,
      //   remoteVideoRef: remoteVideoRef.current,
      //   onConnectionStatusChange: setConnectionStatus,
      //   onPeersChange: setPeers,
      //   userId: user.id,
      //   userName: user.name,
      //   role: user.role,
      // })

      // Join the room
      // joinRoom(id)
      webrtcRef.current = true
    } catch (error) {
      console.error("Error fetching interview details:", error)
      setError("Failed to load interview details. Please try again later.")
      setLoading(false)
    }
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const response = await api.post("/messages", {
        interview_id: id,
        content: newMessage,
      })

      setMessages([...messages, response.data.message])
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    }
  }

  const handleCodeChange = (newCode) => {
    setCode(newCode)

    // Debounce code updates to avoid too many socket emissions
    if (codeChangeTimeoutRef.current) {
      clearTimeout(codeChangeTimeoutRef.current)
    }

    codeChangeTimeoutRef.current = setTimeout(() => {
      // Emit code change to other users
      if (socketRef.current) {
        socketRef.current.emit("code_update", {
          interviewId: id,
          userId: user.id,
          code: newCode,
          language: language,
        })
      }

      // Also save to the server periodically
      api
        .post(`/interviews/${id}/code`, {
          code: newCode,
          language,
        })
        .catch((error) => {
          console.error("Error saving code:", error)
        })
    }, 500) // Debounce for 500ms
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)

    // Emit language change to other users
    if (socketRef.current) {
      socketRef.current.emit("code_update", {
        interviewId: id,
        userId: user.id,
        code: code,
        language: newLanguage,
      })
    }
  }

  const submitCode = async () => {
    try {
      await api.post(`/interviews/${id}/code`, {
        code,
        language,
      })
      alert("Code submitted successfully!")
    } catch (error) {
      console.error("Error submitting code:", error)
      alert("Failed to submit code. Please try again.")
    }
  }

  const selectQuestion = async (questionId) => {
    try {
      const response = await api.post(`/interviews/${id}/question`, {
        question_id: questionId,
      })
      console.log("question", response.data)
      setCurrentQuestion(response.data.interview.current_question)
      setShowQuestionModal(false)
    } catch (error) {
      console.error("Error setting question:", error)
      alert("Failed to set question. Please try again.")
    }
  }

  const createNewQuestion = async () => {
    if (!newQuestionText.trim()) return

    try {
      const response = await api.post("/coding-questions", {
        title: newQuestionText.substring(0, 50),
        description: newQuestionText,
        difficulty: "medium",
      })

      const newQuestion = response.data.question
      setAvailableQuestions([...availableQuestions, newQuestion])
      await selectQuestion(newQuestion.id)
      setNewQuestionText("")
    } catch (error) {
      console.error("Error creating question:", error)
      alert("Failed to create question. Please try again.")
    }
  }

  const submitFeedback = async () => {
    try {
      if (interview.feedback) {
        await api.put(`/feedback/${interview.feedback.id}`, {
          rating: feedback.rating,
          comments: feedback.comments,
        })
      } else {
        await api.post("/feedback", {
          interview_id: id,
          rating: feedback.rating,
          comments: feedback.comments,
        })
      }

      // Update interview status to completed
      await api.put(`/interviews/${id}`, { status: "completed" })

      setShowFeedbackModal(false)
      alert("Feedback submitted successfully!")
      navigate("/dashboard")
    } catch (error) {
      console.error("Error submitting feedback:", error)
      alert("Failed to submit feedback. Please try again.")
    }
  }

  const endInterview = () => {
    setShowFeedbackModal(true)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <svg
            className="animate-spin h-10 w-10 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!canJoin) {
    return (
      <DashboardLayout>
        <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                You can only join this interview 10 minutes before the scheduled time.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{interview.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {new Date(interview.date).toLocaleDateString()} • {interview.start_time} - {interview.end_time}
          </p>
        </div>
        <div className="flex space-x-2">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              connectionStatus === "connected"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {connectionStatus === "connected" ? "Connected" : "Disconnected"}
          </span>
          <button onClick={endInterview} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
            End Interview
          </button>
        </div>
      </div>

      {currentQuestion && (
        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Current Question</h2>
            {isInterviewer && (
              <button
                onClick={() => setShowQuestionModal(true)}
                className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Change Question
              </button>
            )}
          </div>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{currentQuestion.title}</p>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{currentQuestion.description}</p>
        </div>
      )}

      {isInterviewer && !currentQuestion && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">No Question Selected</h2>
            <button
              onClick={() => setShowQuestionModal(true)}
              className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Select Question
            </button>
          </div>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            Select a coding question for the candidate to work on.
          </p>
        </div>
      )}

      <div className="grid gap-6">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Video Call</h2>
            </div>
            <div className="p-4">
              <div className="relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto rounded-lg bg-gray-900"
                  style={{ minHeight: "240px" }}
                />
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute bottom-4 right-4 w-1/4 h-auto rounded-lg border-2 border-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Code Editor</h2>
                {isInterviewer && isTyping && (
                  <span className="ml-2 text-xs text-green-600 animate-pulse">Candidate is typing...</span>
                )}
              </div>
              <div className="p-4">
                <CodeEditor
                  initialCode={code}
                  initialLanguage={language}
                  onCodeChange={handleCodeChange}
                  onLanguageChange={handleLanguageChange}
                  onSubmit={submitCode}
                  readOnly={!isInterviewer}
                  height="400px"
                />
              </div>
            </div>
          </div>

          {/* <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Chat</h2>
            </div>
            <div className="p-4 h-64 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">No messages yet</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.user_id === user.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.user_id === user.id
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">{new Date(message.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={sendMessage} className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Send
                </button>
              </form>
            </div>
          </div> */}
        </div>
      </div>

      {/* Question Selection Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Select a Question
                    </h3>
                    <div className="mt-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Create a New Question
                        </label>
                        <textarea
                          value={newQuestionText}
                          onChange={(e) => setNewQuestionText(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          rows={3}
                          placeholder="Enter a new question..."
                        ></textarea>
                        <button
                          onClick={createNewQuestion}
                          className="mt-2 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                        >
                          Create & Select
                        </button>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Or Select an Existing Question
                        </label>
                        <div className="mt-2 max-h-60 overflow-y-auto">
                          {availableQuestions.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No questions available</p>
                          ) : (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                              {availableQuestions.map((question) => (
                                <li key={question.id} className="py-2">
                                  <button
                                    onClick={() => selectQuestion(question.id)}
                                    className="w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                  >
                                    <p className="font-medium text-gray-900 dark:text-white">{question.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                      {question.description}
                                    </p>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowQuestionModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Provide Feedback
                    </h3>
                    <div className="mt-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Rating (1-5)
                        </label>
                        <div className="mt-2 flex space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFeedback({ ...feedback, rating: star })}
                              className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                feedback.rating >= star
                                  ? "text-yellow-400 hover:text-yellow-500"
                                  : "text-gray-300 hover:text-gray-400"
                              }`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comments</label>
                        <textarea
                          value={feedback.comments}
                          onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          rows={4}
                          placeholder="Provide detailed feedback about the interview..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={submitFeedback}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Submit Feedback
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowFeedbackModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default InterviewPage

