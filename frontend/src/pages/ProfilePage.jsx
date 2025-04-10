
import { useState, useEffect, useContext } from "react"
import DashboardLayout from "../components/DashboardLayout"
import { AuthContext } from "../contexts/AuthContext"
import api from "../services/api"

const ProfilePage = () => {
  const { user } = useContext(AuthContext)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    skills: ""||"JavaScript, React, Node.js",
    experience: ""||"2 years of experience",
    field_of_interest: ""||"Frontend Development",
    expertise_level: ""||"mid",
    bio: ""||"I'm a software engineer with a passion for building web applications.",
    phone: ""||"123-456-7890",
    location: ""||"San Francisco, CA",
    github_url: ""||"github.com/ganeshshit",
    linkedin_url: ""||"linkedin.com/in/ganeshshit",
    website: ""||"ganeshshit.com",
  })
  const [resume, setResume] = useState(null)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile")
        console.log(response.data);
        setProfile(response.data.profile)
        
        // Only update formData with non-null/undefined values from the API
        const profileData = response.data.profile;
        setFormData(prevData => ({
          ...prevData,
          skills: profileData.skills || prevData.skills,
          experience: profileData.experience || prevData.experience,
          field_of_interest: profileData.field_of_interest || prevData.field_of_interest,
          expertise_level: profileData.expertise_level || prevData.expertise_level,
          bio: profileData.bio || prevData.bio,
          phone: profileData.phone || prevData.phone,
          location: profileData.location || prevData.location,
          github_url: profileData.github_url || prevData.github_url,
          linkedin_url: profileData.linkedin_url || prevData.linkedin_url,
          website: profileData.website || prevData.website,
        }))
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching profile:", error)
        setLoading(false)
      }
    }
  
    fetchProfile()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleResumeChange = (e) => {
    setResume(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: "", text: "" })

    try {
      const formDataToSend = new FormData()

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key])
      })

      // Append resume if selected
      if (resume) {
        formDataToSend.append("resume", resume)
      }

      const response = await api.post("/profile", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setProfile(response.data.profile)
      setMessage({ type: "success", text: "Profile updated successfully!" })
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "Failed to update profile. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* <h1 className="text-3xl font-bold   text-gray-900 dark:text-white mb-6">Profile</h1> */}

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
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Update your profile information</p>
            </div>

            {message.text && (
              <div
                className={`px-6 py-4 ${message.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={user?.name || "Ganesh Shit"}
                    disabled
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    To change your name, please contact support
                  </p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user?.email || "shitganesh4@gmail.com"}
                    disabled
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    To change your email, please contact support
                  </p>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Professional Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="field_of_interest"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Field of Interest
                    </label>
                    <select
                      id="field_of_interest"
                      name="field_of_interest"
                      value={formData.field_of_interest}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select a field</option>
                      <option value="Frontend Development">Frontend Development</option>
                      <option value="Backend Engineering">Backend Engineering</option>
                      <option value="Full Stack Development">Full Stack Development</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="expertise_level"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Expertise Level
                    </label>
                    <select
                      id="expertise_level"
                      name="expertise_level"
                      value={formData.expertise_level}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select a level</option>
                      <option value="entry">Entry-Level</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid-Level</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Skills
                    </label>
                    <input
                      type="text"
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="JavaScript, React, Node.js, etc."
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Separate skills with commas</p>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="experience"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Experience
                    </label>
                    <textarea
                      id="experience"
                      name="experience"
                      rows="3"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="Describe your professional experience"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Social Profiles</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="github_url"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      id="github_url"
                      name="github_url"
                      value={formData.github_url}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="linkedin_url"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      id="linkedin_url"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="website"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Personal Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Resume</h3>

                <div>
                  <label htmlFor="resume" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Upload Resume
                  </label>
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    onChange={handleResumeChange}
                    accept=".pdf,.doc,.docx"
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-indigo-50 file:text-indigo-700
                      dark:file:bg-indigo-900 dark:file:text-indigo-300
                      hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Accepted formats: PDF, DOC, DOCX. Max size: 2MB
                  </p>

                  {profile?.resume_path && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Current resume: <span className="font-medium">Resume.pdf</span>
                      </p>
                      <a
                        href={`${import.meta.env.VITE_API_BASE_URL}/profile/${profile.id}/resume`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-1 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Download
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {saving ? (
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
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage

