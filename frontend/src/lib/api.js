import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post('/api/auth/refresh-token', {}, { withCredentials: true });
        localStorage.setItem('accessToken', res.data.accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${res.data.accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
