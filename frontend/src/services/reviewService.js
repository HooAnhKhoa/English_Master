import api from './api';

// Get review dashboard
export const getReviewDashboard = async () => {
  const response = await api.get('/review/dashboard');
  return response.data;
};

// Get vocabularies due for review
export const getVocabDue = async () => {
  const response = await api.get('/review/vocab/due');
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

  const response = await api.get(`/review/quiz/generate?${queryParams}`);
  return response.data;
};

// Submit quiz
export const submitQuiz = async (quizId, answers) => {
  const response = await api.post('/review/quiz/submit', { quizId, answers });
  return response.data;
};

// Get review history
export const getReviewHistory = async () => {
  const response = await api.get('/review/history');
  return response.data;
};

export default {
  getReviewDashboard,
  getVocabDue,
  generateQuiz,
  submitQuiz,
  getReviewHistory
};
