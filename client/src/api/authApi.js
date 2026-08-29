import api from './apiClient.js';

// =====================================================
// AUTHENTICATION API
// =====================================================

// POST /api/auth/register
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// POST /api/auth/login
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// GET /api/auth/me
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// POST /api/auth/logout
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};