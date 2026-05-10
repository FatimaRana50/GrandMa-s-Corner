import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const api = axios.create({ baseURL: `${BASE_URL}/api` });
export const imgUrl = (path) => `${BASE_URL}${path}`;

api.interceptors.request.use(config => {
  const token = localStorage.getItem('gc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gc_token');
      localStorage.removeItem('gc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
