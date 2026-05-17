import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const url: string = error.config?.url ?? '';

      if (status === 401 && !url.includes('/api/auth/me') && !url.includes('/api/auth/login')) {
        window.location.href = '/login';
        return new Promise(() => {});
      }

      if (status === 403) {
        window.location.href = '/';
        return new Promise(() => {});
      }
    }

    return Promise.reject(error);
  },
);

export { api };