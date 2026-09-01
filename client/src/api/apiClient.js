import axios from "axios";

// =====================================================
// API CONFIGURATION
// =====================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

const TOKEN_KEY = "campusconnect_token";
const USER_KEY = "campusconnect_user";

// =====================================================
// TOKEN HELPER
// =====================================================

const getStoredToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// =====================================================
// AXIOS INSTANCE
// =====================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status =
      error.response?.status;

    const currentPath =
      window.location.pathname;

    if (status === 401) {
      // Remove invalid authentication data
      localStorage.removeItem(
        TOKEN_KEY
      );

      localStorage.removeItem(
        USER_KEY
      );

      // Avoid redirect loops on authentication pages
      const authPages = [
        "/login",
        "/register",
        "/admin-login",
      ];

      const isAuthPage =
        authPages.includes(
          currentPath
        );

      if (!isAuthPage) {
        window.location.href =
          "/login";
      }
    }

    return Promise.reject(
      error
    );
  }
);

// =====================================================
// EXPORT
// =====================================================

export default api;