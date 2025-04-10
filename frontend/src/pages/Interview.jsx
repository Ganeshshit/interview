"use client"

import { useState, useEffect, useRef, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DashboardLayout from "../components/DashboardLayout"
import CodeEditor from "../components/CodeEditor"
import webrtcService from "../services/webrtc"
import api from "../api"
import { AuthContext } from "../AuthContext"

const Interview = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [code, setCode] = useState("")
  const [codeLanguage, setCodeLanguage] = useState("javascript")
  const [activeTab, setActiveTab] = useState("chat")
  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [canJoin, setCanJoin] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackScore, setFeedbackScore] = useState(5)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [connectionState, setConnectionState] = useState('disconnected')
  const [connectionError, setConnectionError] = useState(null)

  const messagesEndRef = useRef(null)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  // Check if user can join the interview
  useEffect(() => {
    const checkCanJoin = async () => {
      try {
        const response = await api.get(`/interviews/${id}/can-join`)
        setCanJoin(response.data.canJoin)

        if (!response.data.canJoin) {
          setError("You can only join this interview 10 minutes before the scheduled time.")
        }
      } catch (error) {
        console.error("Error checking join status:", error)
        setError("Failed to check if you can join this interview.")
      }
    }

    checkCanJoin()
    const interval = setInterval(checkCanJoin, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [id])

  // Fetch interview data
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await api.get(`/interviews/${id}`)
        setInterview(response.data.interview)

        if (response.data.interview.code) {
          setCode(response.data.interview.code)
          setCodeLanguage(response.data.interview.code_language || "javascript")
        }

        if (response.data.interview.current_question_id && response.data.interview.currentQuestion) {
          setCurrentQuestion(response.data.interview.currentQuestion)
        }

        // Also fetch messages if available
        if (response.data.interview.messages) {
          const formattedMessages = response.data.interview.messages.map((msg) => ({
            sender: msg.sender.id === user.id ? "You" : msg.sender.name,
            text: msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }))
          setMessages(formattedMessages)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching interview:", error)
        setError("Failed to load interview data")
        setLoading(false)
      }
    }

    fetchInterview()
  }, [id, user.id])

  // Fetch coding questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.get("/coding-questions")
        setQuestions(response.data.questions)
      } catch (error) {
        console.error("Error fetching questions:", error)
      }
    }

    if (user.role === "interviewer" || user.role === "admin") {
      fetchQuestions()
    }
  }, [user.role])

  // Setup WebRTC
  useEffect(() => {
    const setupWebRTC = async () => {
      try {
        setConnectionState('connecting')
        setConnectionError(null)
        
        // Join the room with the interview ID
        const localStream = await webrtcService.joinRoom(id)

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream
        }

        // Set up event listener for remote streams
        webrtcService.onStream((stream, userId) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream
            setConnectionState('connected')
          }
        })

        // Monitor connection state changes
        webrtcService.onConnectionStateChange((userId, state) => {
          setConnectionState(state)
          if (state === 'closed' || state === 'failed') {
            setConnectionError('Connection lost. Attempting to reconnect...')
          }
        })

      } catch (error) {
        console.error("Error setting up WebRTC:", error)
        setConnectionError('Failed to establish connection. Please check your camera and microphone permissions.')
        setConnectionState('failed')
      }
    }

    if (!loading && interview && canJoin) {
      setupWebRTC()
    }

    return () => {
      webrtcService.leaveRoom()
    }
  }, [id, loading, interview, canJoin])

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const toggleMic = () => {
    setIsMicOn(!isMicOn)
    webrtcService.toggleAudio(!isMicOn)
  }

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)
    webrtcService.toggleVideo(!isVideoOn)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    const newMessage = {
      sender: "You",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, newMessage])
    setMessage("")

    try {
      // Send message to the backend
      await api.post("/messages", {
        interview_id: id,
        message: message.trim(),
      })
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleCodeChange = (newCode) => {
    setCode(newCode)
  }

  const handleLanguageChange = (newLanguage) => {
    setCodeLanguage(newLanguage)
  }

  const setQuestion = async (questionId) => {
    try {
      const response = await api.post(`/interviews/${id}/question`, {
        question_id: questionId,
      })

      setCurrentQuestion(response.data.interview.currentQuestion)
      setShowQuestionModal(false)
    } catch (error) {
      console.error("Error setting question:", error)
    }
  }

  const submitFeedback = async () => {
    if (!feedbackText.trim()) return

    setSubmittingFeedback(true)

    try {
      await api.post("/feedback", {
        interview_id: id,
        score: feedbackScore,
        remarks: feedbackText,
        technical_skills: feedbackScore,
        communication_skills: feedbackScore,
        problem_solving: feedbackScore,
        culture_fit: feedbackScore,
        recommendation: feedbackScore >= 7 ? "hire" : feedbackScore >= 4 ? "consider" : "reject",
      })

      // Update interview status
      await api.put(`/interviews/${id}`, {
        status: "completed",
      })

      alert("Feedback submitted successfully!")
      navigate("/dashboard")
    } catch (error) {
      console.error("Error submitting feedback:", error)
      alert("Failed to submit feedback. Please try again.")
    } finally {
      setSubmittingFeedback(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
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

  if (error && !canJoin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-4rem)]">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar Toggle for all screen sizes */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-600 dark:text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">InterviewPro</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">{interview.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(interview.date).toLocaleDateString()} • {interview.start_time} - {interview.end_time}
              </p>
              <div className="mt-2 px-3 py-1 inline-block rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm font-medium">
                {interview.status.charAt(0).toUpperCase() + interview.status.slice(1).replace("_", " ")}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 dark:text-white mb-2">Participants</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-medium">
                    {interview.candidate?.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{interview.candidate?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Candidate</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-300 font-medium">
                    {interview.interviewer?.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{interview.interviewer?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Interviewer</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 dark:text-white mb-2">Interview Details</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-600 dark:text-gray-400">Field: </span>
                  <span className="font-medium text-gray-800 dark:text-white">{interview.field}</span>
                </p>
                <p>
                  <span className="text-gray-600 dark:text-gray-400">Level: </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {interview.level.charAt(0).toUpperCase() + interview.level.slice(1)}
                  </span>
                </p>
                {interview.notes && (
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">Notes: </span>
                    <span className="font-medium text-gray-800 dark:text-white">{interview.notes}</span>
                  </p>
                )}
              </div>
            </div>

            {(user.role === "interviewer" || user.role === "admin") && (
              <div className="mt-auto">
                <button
                  onClick={() => setShowQuestionModal(true)}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Select Question
                </button>

                <div className="mt-4">
                  <h4 className="text-md font-medium text-gray-800 dark:text-white mb-2">Submit Feedback</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Score (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={feedbackScore}
                        onChange={(e) => setFeedbackScore(Number.parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Feedback</label>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        rows="4"
                      ></textarea>
                    </div>
                    <button
                      onClick={submitFeedback}
                      disabled={submittingFeedback || !feedbackText.trim()}
                      className={`w-full px-4 py-2 rounded-md ${
                        submittingFeedback || !feedbackText.trim()
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`min-h-screen transition-all duration-300 ${sidebarOpen ? "pl-64" : "pl-0"}`}>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Question Banner (if a question is selected) */}
          {currentQuestion && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{currentQuestion.title}</h3>
                  <div className="mt-1 flex items-center">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        currentQuestion.difficulty === "easy"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : currentQuestion.difficulty === "medium"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                    </span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full">
                      {currentQuestion.language}
                    </span>
                  </div>
                </div>
                {(user.role === "interviewer" || user.role === "admin") && (
                  <button
                    onClick={() => setShowQuestionModal(true)}
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Change Question
                  </button>
                )}
              </div>
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{currentQuestion.description}</p>
              </div>
              {currentQuestion.starter_code && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Starter Code:</h4>
                  <pre className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-200 text-sm overflow-auto">
                    {currentQuestion.starter_code}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${sidebarOpen ? "lg:col-span-2" : "lg:col-span-2"} flex flex-col`}>
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg flex-1 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Video Call</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.role === "candidate"
                      ? `You are in a call with ${interview.interviewer?.name || "your interviewer"}`
                      : `You are in a call with ${interview.candidate?.name || "the candidate"}`}
                  </p>
                </div>
                <div className="flex-1 p-0 flex flex-col">
                  <div className="relative flex-1 bg-gray-900 flex items-center justify-center">
                    <div className="absolute top-4 left-4 z-10">
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        connectionState === 'connected' ? 'bg-green-500' :
                        connectionState === 'connecting' ? 'bg-yellow-500' :
                        connectionState === 'failed' ? 'bg-red-500' :
                        'bg-gray-500'
                      } text-white`}>
                        {connectionState.charAt(0).toUpperCase() + connectionState.slice(1)}
                      </div>
                    </div>

                    {connectionError && (
                      <div className="absolute top-12 left-4 z-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {connectionError}
                      </div>
                    )}

                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

                    {!remoteVideoRef.current?.srcObject && (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-center">
                        <div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 mx-auto mb-2 opacity-20"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="opacity-50">Waiting for the other participant to join...</p>
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-4 right-4 w-32 h-24 bg-slate-800 rounded-lg overflow-hidden">
                      <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

                      {!isVideoOn && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-center bg-slate-800 bg-opacity-80">
                          <div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 mx-auto opacity-50"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                              />
                            </svg>
                            <p className="text-xs opacity-50">Camera off</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex justify-center gap-2">
                    <button
                      onClick={toggleMic}
                      className={`p-2 rounded-full ${
                        isMicOn
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {isMicOn ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                            strokeDasharray="2 2"
                          />
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={toggleVideo}
                      className={`p-2 rounded-full ${
                        isVideoOn
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {isVideoOn ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex-1 flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setActiveTab("chat")}
                      className={`text-sm font-medium pb-2 ${
                        activeTab === "chat"
                          ? "text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      }`}
                    >
                      Chat
                    </button>
                    <button
                      onClick={() => setActiveTab("code")}
                      className={`text-sm font-medium pb-2 ${
                        activeTab === "code"
                          ? "text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      }`}
                    >
                      Code Editor
                    </button>
                  </div>
                </div>

                {activeTab === "chat" && (
                  <div className="flex-1 flex flex-col p-0">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No messages yet. Start the conversation!
                        </div>
                      ) : (
                        messages.map((msg, index) => (
                          <div key={index} className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
                            <div className={`flex gap-2 max-w-[80%] ${msg.sender === "You" ? "flex-row-reverse" : ""}`}>
                              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                                  {msg.sender[0]}
                                </span>
                              </div>
                              <div>
                                <div
                                  className={`rounded-lg p-3 ${
                                    msg.sender === "You"
                                      ? "bg-indigo-600 text-white"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                  }`}
                                >
                                  {msg.text}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {msg.sender} • {msg.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                    <form onSubmit={sendMessage} className="p-4 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === "code" && (
                  <div className="flex-1 flex flex-col p-4">
                    <CodeEditor
                      initialCode={code}
                      language={codeLanguage}
                      onCodeChange={handleCodeChange}
                      onLanguageChange={handleLanguageChange}
                      interviewId={id}
                      readOnly={user.role !== "candidate" && !user.isAdmin}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
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
                    <div className="mt-4 max-h-96 overflow-y-auto">
                      {questions.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">No questions available.</p>
                      ) : (
                        <div className="space-y-3">
                          {questions.map((question) => (
                            <div
                              key={question.id}
                              className="p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                              onClick={() => setQuestion(question.id)}
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white">{question.title}</h4>
                                <div className="flex space-x-2">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      question.difficulty === "easy"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                        : question.difficulty === "medium"
                                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                    }`}
                                  >
                                    {question.difficulty}
                                  </span>
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full">
                                    {question.language}
                                  </span>
                                </div>
                              </div>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {question.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
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
    </div>
  )
}

export default Interview
