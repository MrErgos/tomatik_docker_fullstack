import axios from 'axios';

const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? ''
    : process.env.REACT_APP_API_URL || 'https://tomitik.ru';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Удаляем Bearer-токен, вместо этого добавим X-CSRF-TOKEN
api.interceptors.request.use(
  (config) => {
    const csrfToken = localStorage.getItem('csrfToken');
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;