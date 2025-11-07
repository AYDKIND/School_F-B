import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import config from '../config/config.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // In E2E mode, trust localStorage token/role to avoid backend coupling
        if (config.IS_E2E) {
          const tokenFromStorage = localStorage.getItem('authToken');
          const role = localStorage.getItem('userRole');
          if (tokenFromStorage && role) {
            setUser({ id: 'e2e-user', email: 'e2e@local' });
            setUserRole(role);
            setToken(tokenFromStorage);
          }
          return;
        }

        const tokenFromStorage = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole');
        
        if (tokenFromStorage && role) {
          // Verify token with backend
          const response = await authAPI.verifyToken();
          setUser(response.data.data.user); // Fixed: access nested data
          setUserRole(role);
          setToken(tokenFromStorage);
        }
      } catch (error) {
        // Token is invalid, clear storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        setUser(null);
        setUserRole(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // Avoid logging raw credentials in production for security
      if (process.env.NODE_ENV !== 'production') {
        console.log('Frontend: Attempting login for role:', credentials?.role);
      }
      const response = await authAPI.login(credentials);
      if (process.env.NODE_ENV !== 'production') {
        console.log('Frontend: Login response:', response.data);
      }
      
      const { token, user, role } = response.data.data; // Fixed: access nested data
      if (process.env.NODE_ENV !== 'production') {
        console.log('Frontend: Extracted data:', { token: token?.substring(0, 50) + '...', user: user?.email, role });
      }
      
      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', role);
      if (process.env.NODE_ENV !== 'production') {
        console.log('Frontend: Stored in localStorage - token:', localStorage.getItem('authToken')?.substring(0, 50) + '...', 'role:', localStorage.getItem('userRole'));
      }
      
      setUser(user);
      setUserRole(role);
      setToken(token);
      
      return { success: true, role };
    } catch (error) {
      const serverMessage = error.response?.data?.message;
      const networkMessage = error.message;
      const errorMessage = error.userMessage || serverMessage || networkMessage || 'Login failed';
      // Log a concise, readable error for troubleshooting
      console.error('Frontend: Login failed:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      setUser(null);
      setUserRole(null);
      setToken(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    userRole,
    token,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user,
    isAdmin: userRole === 'admin',
    isStudent: userRole === 'student',
    isFaculty: userRole === 'faculty',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;