import api from './apiClient.js';

// =====================================================
// STUDENT PROFILE API
// =====================================================

// GET /api/users/profile
export const getProfile = async () => {
  const response = await api.get('/users/profile');

  return response.data;
};

// =====================================================
// PUT /api/users/profile
export const updateProfile = async (profileData) => {
  const response = await api.put(
    '/users/profile',
    profileData
  );

  return response.data;
};

// =====================================================
// POST /api/users/profile/resume
export const uploadResume = async (file) => {
  const formData = new FormData();

  formData.append('resume', file);

  const response = await api.post(
    '/users/profile/resume',
    formData
  );

  return response.data;
};

// =====================================================
// DELETE /api/users/profile/resume
export const deleteResume = async () => {
  const response = await api.delete(
    '/users/profile/resume'
  );

  return response.data;
};