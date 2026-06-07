// API client z JWT token handling
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Pridobi token iz localStorage
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Shrani token v localStorage
  setToken(token) {
    if (token) {
      localStorage.setItem('authToken', token);
    }
  }

  // Odstrani token iz localStorage
  removeToken() {
    localStorage.removeItem('authToken');
  }

  // Glavna fetch metoda z avtomatskim dodajanjem Authorization headerja
  async request(endpoint, options = {}) {
    const token = this.getToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Dodaj Authorization header, če token obstaja
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();
      
      // Če je 401, token je neveljaven - odstrani ga
      if (response.status === 401) {
        this.removeToken();
        throw new Error(data.message);
      }

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Helper metode
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body, options = {}) {
  return this.request(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;
