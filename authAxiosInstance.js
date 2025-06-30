import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response,
  error => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (originalRequest.url && originalRequest.url.includes('/auth/refresh')) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');
      return new Promise((resolve, reject) => {
        axios
          .post(`${process.env.REACT_APP_API_URL}/auth/refresh`, { refreshToken })
          .then(({ data }) => {
            const { accessToken, refreshToken: newRefreshToken } = data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            processQueue(null, accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            resolve(apiClient(originalRequest));
          })
          .catch(err => {
            processQueue(err, null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }
    return Promise.reject(error);
  }
);