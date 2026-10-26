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

  const forgotPassword = async ({ email, newPassword }) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await authAPI.forgotPassword({ email, newPassword });
      return { success: true, message: data.message || 'Password reset successfully.' };
    } catch (err) {
      const msg = err.message || 'Password reset failed. Please try again.';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!token || token.startsWith('demo-guest-token-')) return user;
    try {
      const data = await authAPI.getProfile();
      if (data?.user) {
        const updated = {
          ...user,
          ...data.user,
          token: token,
        };
        setUser(updated);
        localStorage.setItem('chatgpt_user', JSON.stringify(updated));
        return updated;
      }
    } catch (err) {
      console.warn('Failed to refresh user profile:', err.message);
    }
    return user;
  };

  const updateUserProfile = async (payload) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      if (token && token.startsWith('demo-guest-token-')) {
        // Guest mode simulated update
        const updated = {
          ...user,
          fullName: payload.fullName || {
            firstName: payload.firstName || user.fullName?.firstName,
            lastName: payload.lastName || user.fullName?.lastName,
          },
          email: payload.email || user.email,
        };
        setUser(updated);
        localStorage.setItem('chatgpt_user', JSON.stringify(updated));
        return { success: true, user: updated, message: 'Profile updated in guest mode.' };
      }

      const data = await authAPI.updateUser(payload);
      if (data?.user) {
        const updated = {
          ...user,
          fullName: data.user.fullName,
          email: data.user.email,
          token: token,
        };
        setUser(updated);
        localStorage.setItem('chatgpt_user', JSON.stringify(updated));
        return { success: true, user: updated, message: data.message || 'Profile updated successfully.' };
      }
      return { success: true, message: data.message || 'Profile updated successfully.' };
    } catch (err) {
      const msg = err.message || 'Failed to update profile. Please try again.';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // Synchronize fresh profile on mount
  useEffect(() => {
    if (token && !token.startsWith('demo-guest-token-')) {
      fetchUserProfile();
    }
  }, [token]);

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
        forgotPassword,
        fetchUserProfile,
        updateUserProfile,
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
