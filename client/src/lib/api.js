import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    // Network error (server down)
    if (!err.response) {
      return Promise.reject(new Error('Cannot reach server. Make sure the backend is running on port 5000.'));
    }
    // Server returned an error response
    const message = err.response?.data?.message || `Request failed (${err.response.status})`;
    return Promise.reject(new Error(message));
  }
);

export default api;
