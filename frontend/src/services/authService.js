import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Register user
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get user data' };
  }
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/profile`, profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/change-password`, passwordData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to change password' };
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
}; 