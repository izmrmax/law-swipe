import { apiClient } from './authAxiosInstance'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

let isRefreshing = false
let refreshSubscribers = []

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback)
}

function onRefreshed(token) {
  refreshSubscribers.forEach(cb => cb(token))
  refreshSubscribers = []
}

function saveTokens({ accessToken, refreshToken }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  delete apiClient.defaults.headers.common.Authorization
}

async function signup(data) {
  const response = await apiClient.post('/auth/signup', data)
  const { accessToken, refreshToken } = response.data
  if (accessToken && refreshToken) {
    saveTokens({ accessToken, refreshToken })
  }
  return response.data
}

async function login(creds) {
  const response = await apiClient.post('/auth/login', creds)
  const { accessToken, refreshToken } = response.data
  if (accessToken && refreshToken) {
    saveTokens({ accessToken, refreshToken })
  }
  return response.data
}

async function logout() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  try {
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken })
    }
  } catch (e) {
    // ignore errors on logout
  } finally {
    clearTokens()
  }
}

async function refreshToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }
  const response = await apiClient.post('/auth/refresh', { refreshToken })
  const newAccessToken = response.data.accessToken
  const newRefreshToken = response.data.refreshToken || refreshToken
  if (newAccessToken) {
    saveTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken })
  }
  return response.data
}

apiClient.interceptors.response.use(
  response => response,
  error => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(token => {
            originalRequest.headers['authorization'] = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          })
        })
      }
      originalRequest._retry = true
      isRefreshing = true
      return new Promise((resolve, reject) => {
        refreshToken()
          .then(data => {
            const newToken = data.accessToken
            onRefreshed(newToken)
            originalRequest.headers['authorization'] = `Bearer ${newToken}`
            resolve(apiClient(originalRequest))
          })
          .catch(err => {
            clearTokens()
            reject(err)
          })
          .finally(() => {
            isRefreshing = false
          })
      })
    }
    return Promise.reject(error)
  }
)

export { signup, login, logout, refreshToken }