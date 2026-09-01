import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from 'react';

import {
  register as registerApi,
  login as loginApi,
  getCurrentUser,
  logout as logoutApi,
} from '../api/authApi.js';

const TOKEN_KEY = 'campusconnect_token';
const USER_KEY = 'campusconnect_user';

const AuthContext = createContext(null);

// =====================================================
// SAFE LOCAL STORAGE HELPERS
// =====================================================

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

const getStoredToken = () => {
  return (
    localStorage.getItem(TOKEN_KEY) || null
  );
};

// =====================================================
// INITIAL STATE
// =====================================================

const initialToken = getStoredToken();

const initialState = {
  user: getStoredUser(),
  token: initialToken,
  isAuthenticated: !!initialToken,
  isLoading: !!initialToken,
  error: null,
};

// =====================================================
// REDUCER
// =====================================================

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAIL':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// =====================================================
// AUTH PROVIDER
// =====================================================

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(
    authReducer,
    initialState
  );

  // =====================================================
  // PERSIST AUTH
  // =====================================================

  const persistAuth = useCallback(
    (user, token) => {
      localStorage.setItem(
        TOKEN_KEY,
        token
      );

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(user)
      );
    },
    []
  );

  // =====================================================
  // CLEAR AUTH
  // =====================================================

  const clearAuth = useCallback(() => {
    localStorage.removeItem(
      TOKEN_KEY
    );

    localStorage.removeItem(
      USER_KEY
    );
  }, []);

  // =====================================================
  // REGISTER
  // =====================================================

  const register = useCallback(
    async (userData) => {
      dispatch({
        type: 'AUTH_START',
      });

      try {
        const data =
          await registerApi(userData);

        persistAuth(
          data.user,
          data.token
        );

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: data.user,
            token: data.token,
          },
        });

        return data;
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          'Registration failed';

        clearAuth();

        dispatch({
          type: 'AUTH_FAIL',
          payload: message,
        });

        throw new Error(message);
      }
    },
    [
      persistAuth,
      clearAuth,
    ]
  );

  // =====================================================
  // LOGIN
  // =====================================================

  const login = useCallback(
    async (credentials) => {
      dispatch({
        type: 'AUTH_START',
      });

      try {
        const data =
          await loginApi(credentials);

        persistAuth(
          data.user,
          data.token
        );

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: data.user,
            token: data.token,
          },
        });

        return data;
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          'Login failed';

        clearAuth();

        dispatch({
          type: 'AUTH_FAIL',
          payload: message,
        });

        throw new Error(message);
      }
    },
    [
      persistAuth,
      clearAuth,
    ]
  );

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = useCallback(
    async () => {
      try {
        await logoutApi();
      } catch {
        // Even if backend logout fails,
        // always clear frontend authentication.
      } finally {
        clearAuth();

        dispatch({
          type: 'LOGOUT',
        });
      }
    },
    [clearAuth]
  );

  // =====================================================
  // FETCH / VERIFY CURRENT USER
  // =====================================================

  const fetchCurrentUser = useCallback(
    async () => {
      const token =
        getStoredToken();

      if (!token) {
        clearAuth();

        dispatch({
          type: 'LOGOUT',
        });

        return null;
      }

      try {
        const data =
          await getCurrentUser();

        if (!data?.user) {
          throw new Error(
            'User data not found'
          );
        }

        persistAuth(
          data.user,
          token
        );

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: data.user,
            token,
          },
        });

        return data.user;
      } catch {
        clearAuth();

        dispatch({
          type: 'LOGOUT',
        });

        return null;
      }
    },
    [
      persistAuth,
      clearAuth,
    ]
  );

  // =====================================================
  // RESTORE AUTHENTICATION ON APP LOAD
  // =====================================================

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value = {
    ...state,

    register,
    login,
    logout,

    fetchCurrentUser,

    clearError: () =>
      dispatch({
        type: 'CLEAR_ERROR',
      }),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// AUTH HOOK
// =====================================================

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
}