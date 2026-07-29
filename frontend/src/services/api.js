import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const STATIC_DATA_URL = `${import.meta.env.BASE_URL}data/passengers.json`;
const isStaticMode = !API_BASE_URL;


const normalize = (value) => String(value || '').toLowerCase();

const categoryFor = (passenger) => {
  const categories = passenger.categories || [];
  return categories.length > 0 ? categories : ['none'];
};

let staticPassengerCache = null;

const loadStaticPassengers = async () => {
  if (!staticPassengerCache) {
    const response = await fetch(STATIC_DATA_URL);
    if (!response.ok) {
      throw new Error(`Unable to load static passenger data: ${response.status}`);
    }
    staticPassengerCache = await response.json();
  }
  return staticPassengerCache;
};

const filterStaticPassengers = (passengers, params = {}) => {
  const query = normalize(params.search);
  const selectedCategories = params.category ? params.category.split(',').filter(Boolean) : [];

  return passengers.filter((passenger) => {
    if (query) {
      const searchable = [
        passenger.full_name,
        passenger.name_individual,
        passenger.name_family,
        passenger.ship_name,
        passenger.naid,
        passenger.passenger_id,
      ].map(normalize).join(' ');
      if (!searchable.includes(query)) return false;
    }

    if (selectedCategories.length > 0) {
      const passengerCategories = categoryFor(passenger);
      if (!selectedCategories.some((category) => passengerCategories.includes(category))) return false;
    }

    const exactFilters = ['sex', 'arrival_port', 'departure_port', 'pob_country', 'passenger_class'];
    for (const key of exactFilters) {
      if (params[key] && passenger[key] !== params[key]) return false;
    }

    const textFilters = ['name_individual', 'name_family', 'naid', 'ship_name', 'passenger_id'];
    for (const key of textFilters) {
      if (params[key] && !normalize(passenger[key]).includes(normalize(params[key]))) return false;
    }

    if (params.start_date && (!passenger.arrival_date || passenger.arrival_date < params.start_date)) return false;
    if (params.end_date && (!passenger.arrival_date || passenger.arrival_date > params.end_date)) return false;

    return true;
  });
};

const buildStatistics = (passengers) => {
  const byCategory = { laborer: 0, merchant: 0, transit: 0, wifechild: 0, exempt: 0, uncategorized: 0 };
  const bySex = {};
  const byArrivalPort = {};

  passengers.forEach((passenger) => {
    const categories = passenger.categories || [];
    if (categories.length === 0) {
      byCategory.uncategorized += 1;
    } else {
      categories.forEach((category) => {
        if (Object.prototype.hasOwnProperty.call(byCategory, category)) byCategory[category] += 1;
      });
    }

    if (passenger.sex) bySex[passenger.sex] = (bySex[passenger.sex] || 0) + 1;
    if (passenger.arrival_port) byArrivalPort[passenger.arrival_port] = (byArrivalPort[passenger.arrival_port] || 0) + 1;
  });

  return {
    total_passengers: passengers.length,
    by_category: byCategory,
    by_sex: bySex,
    by_arrival_port: byArrivalPort,
  };
};

const createCsvBlob = (records) => {
  const headers = ['Passenger ID', 'NAID', 'Individual Name', 'Family Name', 'Ship Name', 'Departure Port', 'Arrival Port', 'Arrival Date', 'Sex', 'Class', 'Country of Birth', 'Destination', 'Categories'];
  const rows = records.map((passenger) => [
    passenger.passenger_id,
    passenger.naid,
    passenger.name_individual,
    passenger.name_family,
    passenger.ship_name,
    passenger.departure_port,
    passenger.arrival_port,
    passenger.arrival_date,
    passenger.sex,
    passenger.passenger_class,
    passenger.pob_country,
    passenger.destination,
    (passenger.categories || []).join('; '),
  ]);
  const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\\n');
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh: refreshToken });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = import.meta.env.BASE_URL;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register/`, userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login/`, credentials);
    if (response.data.tokens) {
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout/');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  isAuthenticated: () => {
    return !isStaticMode && !!localStorage.getItem('access_token');
  },

  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// Passenger API
export const passengerAPI = {
  fetchPassengers: async (params = {}) => {
    if (isStaticMode) {
      const passengers = await loadStaticPassengers();
      const filtered = filterStaticPassengers(passengers, params);
      return { count: filtered.length, results: filtered };
    }

    const response = await api.get('/passengers/', { params });
    return response.data;
  },

  fetchPassenger: async (id) => {
    if (isStaticMode) {
      const passengers = await loadStaticPassengers();
      return passengers.find((passenger) => String(passenger.id) === String(id)) || passengers.find((passenger) => passenger.passenger_id === id);
    }

    const response = await api.get(`/passengers/${id}/`);
    return response.data;
  },

  fetchStatistics: async () => {
    if (isStaticMode) {
      const passengers = await loadStaticPassengers();
      return buildStatistics(passengers);
    }

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
    if (isStaticMode) {
      const passengers = await loadStaticPassengers();
      return createCsvBlob(filterStaticPassengers(passengers, params));
    }

    const response = await api.get('/passengers/export_csv/', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;
