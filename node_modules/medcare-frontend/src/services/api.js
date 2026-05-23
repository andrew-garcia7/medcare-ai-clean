import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,

  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
  },
});

// ================= REQUEST INTERCEPTOR =================
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

// ================= RESPONSE INTERCEPTOR =================
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error.message ||
      'Something went wrong';

    // Auto logout on unauthorized
    if (error?.response?.status === 401) {
      localStorage.removeItem('medcare-auth');

      // Prevent infinite redirect loop
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;