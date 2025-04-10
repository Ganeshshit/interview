import axios from "axios"

//const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
})

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirect to login page if unauthorized
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export const interviewService = {
  sendInterviewEmail: async (interviewDetails) => {
    const response = await api.post('/email/send', interviewDetails);
    return response.data;
  },
  createInterview: async (interviewerId, scheduledTime) => {
    const response = await api.post('/interviews/create', {
      interviewerId,
      scheduledTime
    });
    return response.data;
  },

  joinInterview: async (interviewId, candidateId) => {
    const response = await api.post('/interviews/join', {
      interviewId,
      candidateId
    });
    return response.data;
  },

  getInterview: async (interviewId) => {
    const response = await api.get(`/interviews/${interviewId}`);
    return response.data;
  },

  endInterview: async (interviewId) => {
    const response = await api.post(`/interviews/${interviewId}/end`);
    return response.data;
  },

  submitCode: async (interviewId, code, language) => {
    const response = await api.post('/code/submit', {
      interviewId,
      code,
      language
    });
    return response.data;
  },

  getQuestions: async () => {
    const response = await api.get('/questions');
    return response.data;
  },

  assignQuestion: async (interviewId, questionId) => {
    const response = await api.post('/questions/assign', {
      interviewId,
      questionId
    });
    return response.data;
  }
};

export const interviewAPI = {
  scheduleInterview: async (interviewData) => {
    const response = await api.post('/interviews/schedule', interviewData);
    return response.data;
  },

  getUpcomingInterviews: async (userId) => {
    const response = await api.get(`/interviews/upcoming/${userId}`);
    return response.data;
  },

  getCompletedInterviews: async (userId) => {
    const response = await api.get(`/interviews/completed/${userId}`);
    return response.data;
  },

  joinInterview: async (roomId) => {
    const response = await api.post(`/interviews/join/${roomId}`);
    return response.data;
  }
};

export default api

