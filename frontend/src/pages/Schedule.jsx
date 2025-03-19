"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import DashboardLayout from "../components/DashboardLayout"
import api from "../api"

const Schedule = () => {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await api.get("/upcoming-interviews")
        setInterviews(response.data.interviews)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching interviews:", error)
        setError("Failed to load interviews")
        setLoading(false)
      }
    }

    fetchInterviews()
    // Refresh every minute to update the canJoin status
    const interval = setInterval(fetchInterviews, 60000)

    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateString) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours, 10))
    date.setMinutes(Number.parseInt(minutes, 10))

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const viewDetails = (interview) => {
    setSelectedInterview(interview)
    setShowDetailsModal(true)
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

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Interviews</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage your scheduled interviews</p>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No upcoming interviews</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            You don't have any interviews scheduled. Check back later.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {interviews.map((interview) => (
              <li key={interview.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <svg
                            className="h-6 w-6 text-indigo-600 dark:text-indigo-300"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{interview.title}</h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <p>
                            {formatDate(interview.date)} • {formatTime(interview.start_time)} -{" "}
                            {formatTime(interview.end_time)}
                          </p>
                          <p className="mt-1">
                            {interview.candidate ? (
                              <>
                                Candidate: <span className="font-medium">{interview.candidate.name}</span>
                              </>
                            ) : (
                              <>
                                Interviewer: <span className="font-medium">{interview.interviewer.name}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewDetails(interview)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 focus:outline-none focus:border-indigo-300 focus:shadow-outline-indigo active:bg-indigo-200 transition ease-in-out duration-150"
                      >
                        View Details
                      </button>

                      {interview.canJoin ? (
                        <Link
                          to={`/interview/${interview.id}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:border-green-700 focus:shadow-outline-green active:bg-green-700 transition ease-in-out duration-150"
                        >
                          Join Now
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-gray-500 bg-gray-200 dark:text-gray-400 dark:bg-gray-700 cursor-not-allowed"
                          title="You can join 10 minutes before the scheduled time"
                        >
                          Join (Available Soon)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interview Details Modal */}
      {showDetailsModal && selectedInterview && (
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
                      Interview Details
                    </h3>
                    <div className="mt-4">
                      <div className="mb-4">
                        <h4 className="text-md font-medium text-gray-800 dark:text-white">Title</h4>
                        <p className="text-gray-600 dark:text-gray-400">{selectedInterview.title}</p>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-md font-medium text-gray-800 dark:text-white">Date & Time</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {formatDate(selectedInterview.date)} • {formatTime(selectedInterview.start_time)} -{" "}
                          {formatTime(selectedInterview.end_time)}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-md font-medium text-gray-800 dark:text-white">
                          {selectedInterview.candidate ? "Candidate" : "Interviewer"}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedInterview.candidate
                            ? selectedInterview.candidate.name
                            : selectedInterview.interviewer.name}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-md font-medium text-gray-800 dark:text-white">Field</h4>
                        <p className="text-gray-600 dark:text-gray-400">{selectedInterview.field}</p>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-md font-medium text-gray-800 dark:text-white">Level</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedInterview.level.charAt(0).toUpperCase() + selectedInterview.level.slice(1)}
                        </p>
                      </div>

                      {selectedInterview.notes && (
                        <div className="mb-4">
                          <h4 className="text-md font-medium text-gray-800 dark:text-white">Notes</h4>
                          <p className="text-gray-600 dark:text-gray-400">{selectedInterview.notes}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-md font-medium text-gray-800 dark:text-white">Status</h4>
                        <div className="mt-1">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {selectedInterview.status.charAt(0).toUpperCase() +
                              selectedInterview.status.slice(1).replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedInterview.canJoin && (
                  <Link
                    to={`/interview/${selectedInterview.id}`}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Join Now
                  </Link>
                )}
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default Schedule

