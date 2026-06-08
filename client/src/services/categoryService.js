import apiClient from './api.js';

const categoryService = {
  // GET /category
  async getAll() {
    return apiClient.get('/category');
  },

  // GET /category/:id
  async getById(id) {
    return apiClient.get(`/category/${id}`);
  },

  // POST /category
  async create(data) {
    return apiClient.post('/category', data);
  },

  // PATCH /category/:id
  async update(id, data) {
    return apiClient.patch(`/category/${id}`, data);
  },

  // DELETE /category/:id
  async remove(id) {
    return apiClient.delete(`/category/${id}`);
  },
};

export default categoryService;