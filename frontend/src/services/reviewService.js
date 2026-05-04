import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get review dashboard
export const getReviewDashboard = async () => {
  const response = await axios.get(`${API_URL}/review/dashboard`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get vocabularies due for review
export const getVocabDue = async () => {
  const response = await axios.get(`${API_URL}/review/vocab/due`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Generate quiz
export const generateQuiz = async (params) => {
  const { type = 'vocab', count = 10, level, topicId } = params;
  const queryParams = new URLSearchParams({
    type,
    count: count.toString(),
    ...(level && { level }),
    ...(topicId && { topicId: topicId.toString() })
  });

  const response = await axios.get(`${API_URL}/review/quiz/generate?${queryParams}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Submit quiz
export const submitQuiz = async (quizId, answers) => {
  const response = await axios.post(
    `${API_URL}/review/quiz/submit`,
    { quizId, answers },
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Get review history
export const getReviewHistory = async () => {
  const response = await axios.get(`${API_URL}/review/history`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export default {
  getReviewDashboard,
  getVocabDue,
  generateQuiz,
  submitQuiz,
  getReviewHistory
};
