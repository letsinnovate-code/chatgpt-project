import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('chatgpt_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('chatgpt_token') || null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const saveAuthData = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    if (userData) {
      localStorage.setItem('chatgpt_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('chatgpt_user');
    }
    if (userToken) {
      localStorage.setItem('chatgpt_token', userToken);
    } else {
      localStorage.removeItem('chatgpt_token');
    }
  };

  const login = async ({ email, password }) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await authAPI.login({ email, password });
      // Login returns { id, fullName, email, token }
      const token = data.token;
      const userData = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        token: data.token,
      };
      saveAuthData(userData, token);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({ firstName, lastName, email, password }) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await authAPI.register({ firstName, lastName, email, password });
      // Register returns { message, user: { id, fullName, email, token } }
      const userPayload = data.user || data;
      const token = userPayload.token;
      const userData = {
        id: userPayload.id || userPayload._id,
        fullName: userPayload.fullName,
        email: userPayload.email,
        token: userPayload.token,
      };
      saveAuthData(userData, token);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    saveAuthData(null, null);
    setAuthError(null);
  };

  const loginAsGuest = () => {
    const guestUser = {
      id: 'guest-' + Date.now(),
      fullName: { firstName: 'Alex', lastName: 'Dev' },
      email: 'alex.dev@example.com',
      token: 'demo-guest-token-' + Date.now(),
    };
    saveAuthData(guestUser, guestUser.token);
    setAuthError(null);
    return guestUser;
  };

  const clearError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        authError,
        login,
        register,
        loginAsGuest,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
