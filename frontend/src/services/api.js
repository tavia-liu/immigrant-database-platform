import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/records/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const passengerAPI = {
  fetchPassengers: async (params = {}) => {
    const response = await api.get('/passengers/', { params });
    return response.data;
  },

  fetchPassenger: async (id) => {
    const response = await api.get(`/passengers/${id}/`);
    return response.data;
  },

  fetchStatistics: async () => {
    const response = await api.get('/passengers/statistics/');
    return response.data;
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/passengers/upload_excel/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  exportCSV: async (params = {}) => {
    const response = await api.get('/passengers/export_csv/', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;
