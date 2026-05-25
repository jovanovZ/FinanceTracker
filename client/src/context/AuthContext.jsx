import { createContext, useState, useEffect, useMemo } from 'react';
import authService from '../services/authService.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setIsAuthenticated(false);
      setToken(null);
    } else {
      setToken(token);
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { token: newToken, user: newUser } = await authService.login(email, password);
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const register = async (userData) => {
    try {
      const { token: newToken, user: newUser } = await authService.register(userData);
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
  }), [user, token, isAuthenticated, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};