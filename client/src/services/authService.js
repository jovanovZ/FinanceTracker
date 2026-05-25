import apiClient from './api.js';

const authService = {
  // Login uporabnika
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      // Backend naj vrne: { token, user } ali { accessToken, user }
      // Prilagodi glede na dejanski backend response
      const token = response.token || response.accessToken;
      const user = response.user;

      if (token) {
        apiClient.setToken(token);
      }

      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  // Logout uporabnika
  async logout() {
    try {
      // Če backend ima logout endpoint, ga pokliči
      // await apiClient.post('/auth/logout');
      
      // Odstrani token iz localStorage
      apiClient.removeToken();
    } catch (error) {
      // Tudi če backend logout faila, odstrani token lokalno
      apiClient.removeToken();
      throw error;
    }
  },

  // Registracija uporabnika
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      
      const token = response.token || response.accessToken;
      const user = response.user;

      if (token) {
        apiClient.setToken(token);
      }

      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  // Preveri, ali je uporabnik prijavljen (ali obstaja veljaven token)
  isAuthenticated() {
    return !!apiClient.getToken();
  },

  // Pridobi trenutni token
  getToken() {
    return apiClient.getToken();
  },
};

export default authService;
