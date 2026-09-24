import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('veloop_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Centralizes the "don't leak Mongo/Axios internals" rule from the spec -
// every screen gets a clean, human message instead of a raw error object.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject({ ...err, message });
  }
);

export default api;
