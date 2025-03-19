
import { createContext, useState, useEffect } from "react"
import api from "../services/api.js"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get("/user")
      const userData = response.data.user
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
    } catch (error) {
      console.error("Error fetching user:", error)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    setLoading(true)
    console.log(email,password);
    try {
      const response = await api.post(`${import.meta.env.VITE_API_BASE_URL}/login`, { email, password })
      const { user, token } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      setUser(user)

      return user
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password, role) => {
    setLoading(true)
    try {
      const response = await api.post(`${import.meta.env.VITE_API_BASE_URL}/register`, {
        name,
        email,
        password,
        password_confirmation: password,
        role,
      })

      const { user, token } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      setUser(user)

      return user
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await api.post("/logout")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
      setLoading(false)
    }
  }

  const isAuthenticated = !!user
  const isAdmin = user?.role === "admin"
  const isInterviewer = user?.role === "interviewer"
  const isCandidate = user?.role === "candidate"

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    isInterviewer,
    isCandidate,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

