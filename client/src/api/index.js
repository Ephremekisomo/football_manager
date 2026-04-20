import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('club');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  register: (data) => api.post('/auth/register', data)
};

export { default as authAPI2 } from './auth.js';

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  updateStatus: (id, is_active) => api.patch(`/users/${id}/status`, { is_active }),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats')
};

export const clubAPI = {
  getAll: (params) => api.get('/clubs', { params }),
  getById: (id) => api.get(`/clubs/${id}`),
  create: (data) => api.post('/clubs', data),
  update: (id, data) => api.put(`/clubs/${id}`, data),
  delete: (id) => api.delete(`/clubs/${id}`),
  getStats: () => api.get('/clubs/stats')
};

export const joueurAPI = {
  getAll: (params) => api.get('/joueurs', { params }),
  getById: (id) => api.get(`/joueurs/${id}`),
  create: (data) => api.post('/joueurs', data),
  update: (id, data) => api.put(`/joueurs/${id}`, data),
  delete: (id) => api.delete(`/joueurs/${id}`),
  getByClub: (clubId) => api.get(`/joueurs/club/${clubId}`)
};

export const competitionAPI = {
  getAll: (params) => api.get('/competitions', { params }),
  getById: (id) => api.get(`/competitions/${id}`),
  create: (data) => api.post('/competitions', data),
  update: (id, data) => api.put(`/competitions/${id}`, data),
  delete: (id) => api.delete(`/competitions/${id}`),
  close: (id) => api.patch(`/competitions/${id}/close`),
  activate: (id) => api.patch(`/competitions/${id}/activate`)
};

export const participationAPI = {
  getAll: (params) => api.get('/participations', { params }),
  getById: (id) => api.get(`/participations/${id}`),
  create: (data) => api.post('/participations', data),
  validate: (id) => api.patch(`/participations/${id}/validate`),
  reject: (id) => api.patch(`/participations/${id}/reject`),
  delete: (id) => api.delete(`/participations/${id}`),
  getByCompetition: (competitionId) => api.get(`/participations/competition/${competitionId}`)
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats')
};

export const arbitreAPI = {
  getAll: (params) => api.get('/arbitres', { params }),
  getById: (id) => api.get(`/arbitres/${id}`),
  create: (data) => api.post('/arbitres', data),
  update: (id, data) => api.put(`/arbitres/${id}`, data),
  delete: (id) => api.delete(`/arbitres/${id}`)
};

export const matchAPI = {
  getAll: (params) => api.get('/matchs', { params }),
  getById: (id) => api.get(`/matchs/${id}`),
  create: (data) => api.post('/matchs', data),
  update: (id, data) => api.put(`/matchs/${id}`, data),
  delete: (id) => api.delete(`/matchs/${id}`),
  postpone: (id, data) => api.patch(`/matchs/${id}/postpone`, data),
  cancel: (id) => api.patch(`/matchs/${id}/cancel`),
  getByArbitre: (arbitreId) => api.get(`/matchs/arbitre/${arbitreId}`),
  getCalendar: (params) => api.get('/matchs/calendar', { params })
};

export const classementAPI = {
  getAll: (params) => api.get('/classements', { params })
};

export const tropheeAPI = {
  getAll: (params) => api.get('/trophees', { params }),
  getById: (id) => api.get(`/trophees/${id}`)
};

export const resultatAPI = {
  getAll: (params) => api.get('/resultats', { params }),
  getById: (id) => api.get(`/resultats/${id}`),
  getByMatch: (matchId) => api.get(`/resultats/match/${matchId}`),
  create: (data) => api.post('/resultats', data),
  update: (id, data) => api.put(`/resultats/${id}`, data),
  validate: (id) => api.patch(`/resultats/${id}/validate`),
  delete: (id) => api.delete(`/resultats/${id}`),
  getHistorique: (params) => api.get('/resultats/historique', { params })
};

export default api;
