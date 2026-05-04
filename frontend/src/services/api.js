import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Get today's vocabulary review list
 */
export const getTodayVocab = async () => {
  const response = await api.get('/vocab/today');
  return response.data;
};

/**
 * Review a flashcard
 * @param {number} vocabId - Vocabulary ID
 * @param {string|number} quality - Quality rating: 'forgot', 'hard', 'good', 'easy' or 0-5
 * @param {number} responseTimeMs - Response time in milliseconds
 */
export const reviewFlashcard = async (vocabId, quality, responseTimeMs) => {
  const response = await api.post('/vocab/flashcard/review', {
    vocabId,
    quality,
    responseTimeMs,
  });
  return response.data;
};

/**
 * Get vocabulary statistics
 */
export const getVocabStats = async () => {
  const response = await api.get('/vocab/stats');
  return response.data;
};

/**
 * Login user
 */
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.success && response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
  }
  return response.data;
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export default api;
