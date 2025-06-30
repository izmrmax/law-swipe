import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  config => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  error => Promise.reject(error)
);

const handleError = error => {
  const message = error.response?.data?.message || error.message || 'Unknown error';
  const err = new Error(message);
  err.originalError = error;
  err.status = error.response?.status;
  throw err;
};

export const fetchUsersForModeration = async (params = {}) => {
  try {
    const { data } = await apiClient.get('/admin/users/moderation', { params });
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const moderateUser = async (userId, { action, reason }) => {
  try {
    const { data } = await apiClient.patch(
      `/admin/users/${userId}/moderation`,
      { action, reason }
    );
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const fetchSubscriptionAnalytics = async (params = {}) => {
  try {
    const { data } = await apiClient.get('/admin/subscriptions/analytics', { params });
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const fetchSubscriptions = async (params = {}) => {
  try {
    const { data } = await apiClient.get('/admin/subscriptions', { params });
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const updateSubscriptionStatus = async (subscriptionId, { status, notes }) => {
  try {
    const { data } = await apiClient.patch(
      `/admin/subscriptions/${subscriptionId}`,
      { status, notes }
    );
    return data;
  } catch (error) {
    handleError(error);
  }
};