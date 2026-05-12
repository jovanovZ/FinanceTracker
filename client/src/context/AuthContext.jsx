import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ob zagonu aplikacije preveri, ali obstaja token v localStorage
  useEffect(() => {
    const initAuth = () => {
      const savedToken = authService.getToken();
      
      if (savedToken) {
        setToken(savedToken);
        setIsAuthenticated(true);
        // Če želiš, lahko tukaj pokličeš API za pridobitev user podatkov
        // npr. fetchCurrentUser();
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login funkcija
  const login = async (email, password) => {
    try {
      const { token: newToken, user: newUser } = await authService.login(email, password);
      
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout funkcija
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Vedno počisti state, tudi če backend logout faila
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Register funkcija
  const register = async (userData) => {
    try {
      const { token: newToken, user: newUser } = await authService.register(userData);
      
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
