
import { useState, useEffect } from "react"
import DashboardLayout from "../components/DashboardLayout"
import api from "../services/api"

const InterviewerPage = () => {
  const [activeTab, setActiveTab] = useState("availability")
  const [availabilities, setAvailabilities] = useState([])
  const [interviews, setInterviews] = useState([])
  const [codingQuestions, setCodingQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
  })
  const [questionFormData, setQuestionFormData] = useState({
    title: "",
    description: "",
    difficulty: "easy",
  })
  const [message, setMessage] = useState({ type: "", text: "" })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch availabilities
        const availabilityResponse = await api.get("/availability")
        setAvailabilities(availabilityResponse.data.availability)

        // Fetch interviews
        const interviewsResponse = await api.get("/interviews")
        setInterviews(interviewsResponse.data.interviews)

        // Fetch coding questions
        const questionsResponse = await api.get("/coding-questions")
        console.log("questionsResponse",questionsResponse);
        setCodingQuestions(questionsResponse.data.questions)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleQuestionChange = (e) => {
    const { name, value } = e.target
    setQuestionFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitAvailability = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: "", text: "" })

    try {
      const response = await api.post("/availability", formData)

      setAvailabilities([...availabilities, response.data.availability])
      setFormData({
        date: "",
        start_time: "",
        end_time: "",
      })
      setMessage({ type: "success", text: "Availability added successfully!" })
    } catch (error) {
      console.error("Error adding availability:", error)
      setMessage({ type: "error", text: "Failed to add availability. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitQuestion = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: "", text: "" })

    try {
      const response = await api.post("/coding-questions", questionFormData)

      setCodingQuestions([...codingQuestions, response.data.question])
      setQuestionFormData({
        title: "",
        description: "",
        difficulty: "easy",
      })
      setMessage({ type: "success", text: "Coding question added successfully!" })
    } catch (error) {
      console.error("Error adding coding question:", error)
      setMessage({ type: "error", text: "Failed to add coding question. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAvailability = async (id) => {
    try {
      await api.delete(`/availability/${id}`)
      setAvailabilities(availabilities.filter((item) => item.id !== id))
      setMessage({ type: "success", text: "Availability deleted successfully!" })
    } catch (error) {
      console.error("Error deleting availability:", error)
      setMessage({ type: "error", text: "Failed to delete availability. Please try again." })
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Interviewer Dashboard</h1>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("availability")}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === "availability"
                    ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Availability
              </button>
              <button
                onClick={() => setActiveTab("interviews")}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === "interviews"
                    ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Interviews
              </button>
              <button
                onClick={() => setActiveTab("questions")}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === "questions"
                    ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Coding Questions
              </button>
            </nav>
          </div>

          {message.text && (
            <div
              className={`px-6 py-4 ${message.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}
            >
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <svg
                className="animate-spin h-8 w-8 text-indigo-600"
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
          ) : (
            <>
              {activeTab === "availability" && (
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Availability</h2>

                      <form onSubmit={handleSubmitAvailability} className="space-y-4">
                        <div>
                          <label
                            htmlFor="date"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Date
                          </label>
                          <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            min={new Date().toISOString().split("T")[0]}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="start_time"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                              Start Time
                            </label>
                            <input
                              type="time"
                              id="start_time"
                              name="start_time"
                              value={formData.start_time}
                              onChange={handleChange}
                              required
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="end_time"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                              End Time
                            </label>
                            <input
                              type="time"
                              id="end_time"
                              name="end_time"
                              value={formData.end_time}
                              onChange={handleChange}
                              required
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                          >
                            {submitting ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Adding...
                              </>
                            ) : (
                              "Add Availability"
                            )}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Availability</h2>

                      {availabilities.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-gray-500 dark:text-gray-400">No availability slots added yet</p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-700 shadow overflow-hidden sm:rounded-md">
                          <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                            {availabilities.map((slot) => (
                              <li key={slot.id}>
                                <div className="px-4 py-4 sm:px-6">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-gray-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      <p className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {new Date(slot.date).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="ml-2 flex-shrink-0">
                                      <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          slot.is_booked
                                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                        }`}
                                      >
                                        {slot.is_booked ? "Booked" : "Available"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                      <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        {slot.start_time} - {slot.end_time}
                                      </p>
                                    </div>
                                    {!slot.is_booked && (
                                      <div className="mt-2 flex items-center text-sm sm:mt-0">
                                        <button
                                          onClick={() => handleDeleteAvailability(slot.id)}
                                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "interviews" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Interviews</h2>

                  {interviews.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400">No interviews scheduled yet</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 shadow overflow-hidden sm:rounded-md">
                      <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                        {interviews.map((interview) => (
                          <li key={interview.id}>
                            <div className="px-4 py-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {interview.title}
                                  </h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    with {interview.candidate?.name || "Unknown Candidate"}
                                  </p>
                                </div>
                                <div className="ml-2 flex-shrink-0 flex">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      interview.status === "completed"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                        : interview.status === "scheduled"
                                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                          : interview.status === "in_progress"
                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                    }`}
                                  >
                                    {interview.status.charAt(0).toUpperCase() +
                                      interview.status.slice(1).replace("_", " ")}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex sm:space-x-4">
                                  <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {new Date(interview.date).toLocaleDateString()}
                                  </p>
                                  <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {interview.start_time} - {interview.end_time}
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm sm:mt-0">
                                  <a href={`/interview/${interview.id}`}>
                                    <button className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                      {interview.status === "scheduled" ? "Join" : "View"}
                                    </button>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "questions" && (
                <div className="p-6">
                  <div className="grid gap-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Coding Question</h2>

                      <form onSubmit={handleSubmitQuestion} className="space-y-4">
                        <div>
                          <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Title
                          </label>
                          <input
                            type="text"
                            id="title"
                            name="title"
                            value={questionFormData.title}
                            onChange={handleQuestionChange}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            rows="4"
                            value={questionFormData.description}
                            onChange={handleQuestionChange}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          ></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="difficulty"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                              Difficulty
                            </label>
                            <select
                              id="difficulty"
                              name="difficulty"
                              value={questionFormData.difficulty}
                              onChange={handleQuestionChange}
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>

                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                          >
                            {submitting ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Adding...
                              </>
                            ) : (
                              "Add Question"
                            )}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Your Coding Questions
                      </h2>

                      {codingQuestions.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-gray-500 dark:text-gray-400">No coding questions added yet</p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-700 shadow overflow-hidden sm:rounded-md">
                          <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                            {codingQuestions.map((question) => (
                              <li key={question.id}>
                                <div className="px-4 py-4 sm:px-6">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                        {question.title}
                                      </h3>
                                    </div>
                                    <div className="ml-2 flex-shrink-0">
                                      <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          question.difficulty === "easy"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                            : question.difficulty === "medium"
                                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                        }`}
                                      >
                                        {question.difficulty}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                      <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        {question.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default InterviewerPage

