// api.js
import axios from 'axios';
import { setAuthFromOutside } from '../utils/authContext';
import { backendUrl } from './config';

const api = axios.create({
  baseURL: import.meta.env.VITE_API || backendUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
// Handle 401 & refresh access token automatically
api.interceptors.response.use(
  r => r,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await api.post('/admin/token');
        localStorage.setItem('accessToken', data.accessToken);
        
        // ✅ Tell React we are authenticated again
        setAuthFromOutside(true);

        // ✅ Retry the failed request
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        setAuthFromOutside(false);
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);


export default api;
