import api from './apiClient.js';

// =====================================================
// STUDENT PROFILE API
// =====================================================

// GET /api/users/profile
// Fetch the currently authenticated user's profile.
export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// PUT /api/users/profile
// Update the currently authenticated user's profile.
export const updateProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};