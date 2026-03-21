import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { localStorageKeys } from '@/app/config/local-storage-keys';
import { api } from '@/app/services';

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

type EchoInstance = Echo<'pusher'>;

let echoInstance: EchoInstance | null = null;

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(localStorageKeys.ACCESS_TOKEN);
  const activeTenantId = localStorage.getItem(localStorageKeys.ACTIVE_TENANT_ID);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (activeTenantId) {
    headers['X-Tenant-ID'] = activeTenantId;
  }

  return headers;
}

export function getEchoInstance(): EchoInstance | null {
  if (echoInstance) {
    return echoInstance;
  }

  const token = localStorage.getItem(localStorageKeys.ACCESS_TOKEN);
  if (!token) {
    return null;
  }

  window.Pusher = Pusher;

  const key = import.meta.env.VITE_PUSHER_APP_KEY ?? 'ec333de29ae8b0ee5e51';
  const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'sa1';
  const wsHost = import.meta.env.VITE_PUSHER_WS_HOST;
  const wsPort = parsePort(import.meta.env.VITE_PUSHER_WS_PORT, 80);
  const wssPort = parsePort(import.meta.env.VITE_PUSHER_WSS_PORT, 443);
  const forceTLS = (import.meta.env.VITE_PUSHER_FORCE_TLS ?? 'true') === 'true';
  const enabledTransports = ['ws', 'wss'] as const;

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key,
    cluster,
    wsHost,
    wsPort,
    wssPort,
    forceTLS,
    enabledTransports: [...enabledTransports],
    authEndpoint: `${api.defaults.baseURL}broadcasting/auth`,
    auth: {
      headers: getAuthHeaders(),
    },
  });

  return echoInstance;
}

export function disconnectEcho(): void {
  if (!echoInstance) {
    return;
  }

  echoInstance.disconnect();
  echoInstance = null;
}
