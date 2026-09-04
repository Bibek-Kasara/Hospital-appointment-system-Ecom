import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken: string | null = sessionStorage.getItem('accessToken');
let refreshToken: string | null = sessionStorage.getItem('refreshToken');
let refreshPromise: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    sessionStorage.setItem('accessToken', token);
  } else {
    sessionStorage.removeItem('accessToken');
  }
};

export const getAccessToken = () => accessToken;

export const setRefreshToken = (token: string | null) => {
  refreshToken = token;
  if (token) sessionStorage.setItem('refreshToken', token);
  else sessionStorage.removeItem('refreshToken');
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { withCredentials: true },
    );
    if (data.success && data.data?.accessToken) {
      setAccessToken(data.data.accessToken);
      if (data.data.refreshToken) setRefreshToken(data.data.refreshToken);
      return data.data.accessToken;
    }
    return null;
  } catch {
    setAccessToken(null);
    setRefreshToken(null);
    return null;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (newToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
