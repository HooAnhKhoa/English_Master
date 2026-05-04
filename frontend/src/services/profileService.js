import api from './api';

/**
 * Get user profile with learning overview
 */
export const getProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (data) => {
  try {
    const response = await api.put('/user/profile', data);
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

/**
 * Upload avatar
 */
export const uploadAvatar = async (formData) => {
  try {
    const response = await api.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Upload avatar error:', error);
    throw error;
  }
};

/**
 * Change password
 */
export const changePassword = async (data) => {
  try {
    const response = await api.put('/user/change-password', data);
    return response.data;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

/**
 * Get detailed statistics
 */
export const getDetailedStats = async () => {
  try {
    const response = await api.get('/user/stats/detail');
    return response.data;
  } catch (error) {
    console.error('Get detailed stats error:', error);
    throw error;
  }
};

/**
 * Get activity feed
 */
export const getActivityFeed = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/user/activity-feed', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Get activity feed error:', error);
    throw error;
  }
};

/**
 * Delete account
 */
export const deleteAccount = async (data) => {
  try {
    const response = await api.delete('/user/account', { data });
    return response.data;
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};

/**
 * Check if username is available
 */
export const checkUsernameAvailable = async (username) => {
  try {
    const response = await api.get('/user/check-username', {
      params: { username }
    });
    return response.data;
  } catch (error) {
    console.error('Check username error:', error);
    throw error;
  }
};

/**
 * Get all badges
 */
export const getAllBadges = async () => {
  try {
    const response = await api.get('/badges');
    return response.data;
  } catch (error) {
    console.error('Get all badges error:', error);
    throw error;
  }
};

/**
 * Get user badges
 */
export const getUserBadges = async () => {
  try {
    const response = await api.get('/badges/user');
    return response.data;
  } catch (error) {
    console.error('Get user badges error:', error);
    throw error;
  }
};

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getDetailedStats,
  getActivityFeed,
  deleteAccount,
  checkUsernameAvailable,
  getAllBadges,
  getUserBadges
};
