import { localStorageKeys } from '../config/local-storage-keys';
import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://ssma-gestor.fluxosistemas.com.br/api/',
});

// Request interceptor to add Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(localStorageKeys.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(localStorageKeys.ACCESS_TOKEN);
      localStorage.removeItem(localStorageKeys.USER_DATA);
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 30, // 30 seconds
    },
  },
});
