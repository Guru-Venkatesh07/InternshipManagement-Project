import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ims_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ims_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync user from backend on initial mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ims_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.data);
            localStorage.setItem('ims_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.warn('Session expired or invalid, logging out.');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { token: receivedToken, user: receivedUser } = res.data.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('ims_token', receivedToken);
      localStorage.setItem('ims_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
  };

  const registerStudent = async (formData) => {
    const res = await api.post('/auth/register/student', formData);
    if (res.data?.success) {
      const { token: receivedToken, user: receivedUser } = res.data.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('ims_token', receivedToken);
      localStorage.setItem('ims_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
  };

  const registerEmployer = async (formData) => {
    const res = await api.post('/auth/register/employer', formData);
    if (res.data?.success) {
      const { token: receivedToken, user: receivedUser } = res.data.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('ims_token', receivedToken);
      localStorage.setItem('ims_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success) {
        setUser(res.data.data);
        localStorage.setItem('ims_user', JSON.stringify(res.data.data));
        return res.data.data;
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ims_token');
    localStorage.removeItem('ims_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        registerStudent,
        registerEmployer,
        refreshUser,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
