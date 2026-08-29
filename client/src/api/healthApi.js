import api from './apiClient.js';

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};
