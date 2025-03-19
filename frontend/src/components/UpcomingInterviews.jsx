"use client"

import { useContext } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContext"

const UpcomingInterviews = ({ interviews, loading = false }) => {
  const { user } = useContext(AuthContext)

  if (loading) {
    return (
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
    )
  }

  if (!interviews || interviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No upcoming interviews</p>
        <Link to="/schedule">
          <button className="mt-4 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Schedule Interview
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {interviews.map((interview) => {
        // Determine which user to show based on the current user's role
        const isCandidate = user?.role === "candidate"
        const otherPerson = isCandidate ? interview.interviewer : interview.candidate

        return (
          <div
            key={interview.id}
            className="flex items-start gap-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300 font-medium">{otherPerson?.name?.[0] || "U"}</span>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 dark:text-white">{interview.title}</p>
                <Link to={`/interview/${interview.id}`}>
                  <button className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    Join
                  </button>
                </Link>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">with {otherPerson?.name || "Unknown User"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(interview.date).toLocaleDateString()} • {interview.start_time} - {interview.end_time}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default UpcomingInterviews

