import axios from 'axios';
import {
  getAccessToken,
  refreshAccessToken,
  setAccessToken,
  setRefreshToken
} from './authService';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/', // replace with your API base URL
});


// Request interceptor to add the access token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to refresh token on 401 status
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error('Token refresh failed', err);
        setAccessToken('')
        setRefreshToken('')
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;