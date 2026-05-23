import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('medcare-auth');

    if (stored) {
      const { state } = JSON.parse(stored);

      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
  } catch (err) {
    console.error('Token parse error:', err);
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error.message ||
      'Something went wrong';

    if (error?.response?.status === 401) {
      localStorage.removeItem('medcare-auth');
      window.location.href = '/login';
    }

    return Promise.reject(new Error(message));
  }
);

export default api;