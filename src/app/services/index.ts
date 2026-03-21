import { QueryClient } from '@tanstack/react-query';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredActiveTenantId,
  getStoredUserRaw,
  persistRefreshedAccessToken,
  setStoredActiveTenantId,
} from '@/app/utils/auth-storage';

export const api = axios.create({
  baseURL: 'https://ssma-gestor.fluxosistemas.com.br/api/',
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _tenantRetry?: boolean;
};

let isRefreshing = false;
let requestQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function clearAuthAndRedirect() {
  clearAuthSession();
  window.location.href = '/auth';
}

function getStoredUserId(): number | null {
  const rawUser = getStoredUserRaw();
  if (!rawUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawUser) as { id?: unknown };
    const userId = Number(parsed?.id);
    if (!Number.isFinite(userId) || userId <= 0) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}

function processQueue(error: unknown, token: string | null = null) {
  requestQueue.forEach((queued) => {
    if (error || !token) {
      queued.reject(error ?? new Error('Falha ao renovar token'));
      return;
    }

    queued.resolve(token);
  });

  requestQueue = [];
}

async function refreshToken(): Promise<string> {
  const currentToken = getStoredAccessToken();

  if (!currentToken) {
    throw new Error('Token ausente');
  }

  const { data } = await axios.post<{ api_token?: string; access_token?: string }>(
    `${api.defaults.baseURL}client/refresh`,
    null,
    {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    }
  );

  const newToken = data?.api_token ?? data?.access_token;

  if (!newToken) {
    throw new Error('Token de refresh inválido');
  }

  persistRefreshedAccessToken(newToken);
  api.defaults.headers.Authorization = `Bearer ${newToken}`;

  return newToken;
}

// Request interceptor to add Authorization header
api.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  const activeTenantId = getStoredActiveTenantId();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (activeTenantId) {
    const normalizedTenantId = Number(activeTenantId);
    if (Number.isFinite(normalizedTenantId) && normalizedTenantId > 0) {
      config.headers['X-Tenant-ID'] = String(normalizedTenantId);
    }
  }

  return config;
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const requestUrl = (originalRequest?.url ?? '').toLowerCase();
    const isAuthEndpoint =
      requestUrl.includes('client/auth') ||
      requestUrl.includes('client/refresh') ||
      requestUrl.includes('client/forgot-password') ||
      requestUrl.includes('client/reset-password');

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          requestQueue.push({
            resolve: (token: string) => {
              originalRequest.headers = originalRequest.headers ?? {};
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        processQueue(null, newToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401 && !isAuthEndpoint) {
      clearAuthAndRedirect();
    }

    const responseData = error.response?.data as
      | { error?: string; message?: string }
      | undefined;
    const tenantErrorText = `${responseData?.error ?? ''} ${responseData?.message ?? ''}`.toLowerCase();
    const isTenantError = error.response?.status === 403 && tenantErrorText.includes('tenant');

    if (isTenantError && originalRequest && !originalRequest._tenantRetry) {
      const userId = getStoredUserId();
      if (!userId) {
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      setStoredActiveTenantId(String(userId));
      originalRequest._tenantRetry = true;
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers['X-Tenant-ID'] = String(userId);
      return api(originalRequest);
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
