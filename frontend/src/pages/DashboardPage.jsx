import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import DashboardLayout from "../components/DashboardLayout"
import { AuthContext } from "../contexts/AuthContext"
import Modal from "../components/Modal.jsx"
import api from "../services/api"

const DashboardPage = () => {
  const { user } = useContext(AuthContext)
  const [upcomingInterviews, setUpcomingInterviews] = useState([])
  const [completedInterviews, setCompletedInterviews] = useState(0)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch upcoming interviews
        const upcomingResponse = await api.get("/upcoming-interviews")
        console.log("intervies",upcomingResponse.data)
        setUpcomingInterviews(upcomingResponse.data.interviews)

        // Fetch all interviews to count completed ones
        const allInterviewsResponse = await api.get("/interviews")
        const completedCount = allInterviewsResponse.data.interviews.filter(
          (interview) => interview.status === "completed",
        ).length
        setCompletedInterviews(completedCount)

        const feedbacksResponse = await api.get(`/feedback/${user.id}`)
        // console.log("feedback", feedbacksResponse.data)
        // setActivities(feedbacksResponse.data.feedback)

        // Mock activities data (in a real app, this would come from the backend)
        setActivities([
          {
            id: 1,
            type: "feedback",
            title: "Frontend Developer Interview",
            description: 'You received feedback: "Great problem-solving skills and communication."',
            date: "2 days ago",
          },
          {
            id: 2,
            type: "interview",
            title: "Backend Developer Interview",
            description: "You completed an interview with John Doe. Awaiting feedback.",
            date: "4 days ago",
          },
          {
            id: 3,
            type: "schedule",
            title: "Interview Scheduled",
            description: "You scheduled a Full Stack Developer interview for next Monday.",
            date: "1 week ago",
          },
        ])

        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setLoading(false)
      }
    }

    fetchDashboardData()
    
    // Update current time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timeInterval)
  })

  // Function to check if an interview is within 5 minutes of starting
  const isInterviewActive = (startTime, date) => {
    const interviewDate = new Date(date)
    const [hours, minutes] = startTime.split(':').map(Number)
    
    interviewDate.setHours(hours, minutes, 0, 0)
    
    // Get time difference in minutes
    const timeDiff = (interviewDate - currentTime) / (1000 * 60)
    
    // If time difference is less than or equal to 5 minutes and not in the past
    return timeDiff <= 5 && timeDiff > -60 // Active up to 5 min before and 60 min after start time
  }

  // Function to handle opening the modal with interview details
  const handleViewDetails = (interview) => {
    setSelectedInterview(interview)
    setShowModal(true)
  }

  // Function to close the modal
  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedInterview(null)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-gray-600 text-xl dark:text-gray-300">
              Welcome back, {user?.name}! Here's an overview of your upcoming interviews and activities.
            </p>
          </div>
          <Link to="/schedule">
            <button className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              Schedule Interview
            </button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Interviews</h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingInterviews.length}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {upcomingInterviews.length > 0
                ? `Next: ${new Date(upcomingInterviews[0].date).toLocaleDateString()} at ${upcomingInterviews[0].start_time}`
                : "No upcoming interviews"}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Interviews</h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedInterviews}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {completedInterviews > 0 ? "+2 from last week" : "No completed interviews yet"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Interviews</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your scheduled interviews for the next 7 days</p>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-indigo-600"
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
                </div>
              ) : upcomingInterviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No upcoming interviews</p>
                  <Link to="/schedule">
                    <button className="mt-4 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      Schedule Interview
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingInterviews.map((interview) => {
                    // Determine which user to show based on the current user's role
                    const isCandidate = user?.role === "candidate"
                    const otherPerson = isCandidate ? interview.interviewer : interview.candidate
                    const interviewActive = isInterviewActive(interview.start_time, interview.date)

                    return (
                      <div
                        key={interview.id}
                        className="flex items-start gap-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                      >
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-600 dark:text-gray-300 font-medium">
                            {otherPerson?.name?.[0] || "U"}
                          </span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 dark:text-white">{interview.title}</p>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleViewDetails(interview)}
                                className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              >
                                View Details
                              </button>
                              {interviewActive ? (
                                <Link to={`/interview/${interview.id}`}>
                                  <button className="px-3 py-1 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                    Join
                                  </button>
                                </Link>
                              ) : (
                                <button
                                  disabled
                                  className="px-3 py-1 text-sm rounded-md bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                  title="Interview will be active 5 minutes before start time"
                                >
                                  Join
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            with {otherPerson?.name || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(interview.date).toLocaleDateString()} • {interview.start_time} -{" "}
                            {interview.end_time}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your recent interview activities and feedback</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                  >
                    <div className="rounded-full bg-indigo-100 dark:bg-indigo-900 p-2">
                      {activity.type === "feedback" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                      )}
                      {activity.type === "interview" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      )}
                      {activity.type === "schedule" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
    show={showModal} 
    onClose={handleCloseModal} 
    interview={selectedInterview} 
  />
    </DashboardLayout>
    
  )
}

export default DashboardPage

