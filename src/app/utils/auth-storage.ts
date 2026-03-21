import { localStorageKeys } from '@/app/config/local-storage-keys';

type PersistMode = 'local' | 'session';

type PersistSessionParams = {
  token: string;
  userData: string;
  activeTenantId: string;
  remember: boolean;
};

function getStorage(mode: PersistMode): Storage {
  return mode === 'local' ? localStorage : sessionStorage;
}

function removeFromAllStorages(key: string): void {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

function readFromAnyStorage(key: string): string | null {
  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
}

function resolveSessionStorageMode(): PersistMode {
  if (sessionStorage.getItem(localStorageKeys.ACCESS_TOKEN)) {
    return 'session';
  }

  if (localStorage.getItem(localStorageKeys.ACCESS_TOKEN)) {
    return 'local';
  }

  return getRememberMePreference() ? 'local' : 'session';
}

export function getRememberMePreference(): boolean {
  return localStorage.getItem(localStorageKeys.REMEMBER_ME) !== '0';
}

export function setRememberMePreference(remember: boolean): void {
  localStorage.setItem(localStorageKeys.REMEMBER_ME, remember ? '1' : '0');
}

export function getStoredAccessToken(): string | null {
  return readFromAnyStorage(localStorageKeys.ACCESS_TOKEN);
}

export function getStoredUserRaw(): string | null {
  return readFromAnyStorage(localStorageKeys.USER_DATA);
}

export function getStoredActiveTenantId(): string | null {
  return readFromAnyStorage(localStorageKeys.ACTIVE_TENANT_ID);
}

export function persistAuthSession(params: PersistSessionParams): void {
  const mode: PersistMode = params.remember ? 'local' : 'session';
  const targetStorage = getStorage(mode);
  const secondaryStorage = getStorage(mode === 'local' ? 'session' : 'local');

  secondaryStorage.removeItem(localStorageKeys.ACCESS_TOKEN);
  secondaryStorage.removeItem(localStorageKeys.USER_DATA);
  secondaryStorage.removeItem(localStorageKeys.ACTIVE_TENANT_ID);

  targetStorage.setItem(localStorageKeys.ACCESS_TOKEN, params.token);
  targetStorage.setItem(localStorageKeys.USER_DATA, params.userData);
  targetStorage.setItem(localStorageKeys.ACTIVE_TENANT_ID, params.activeTenantId);
  setRememberMePreference(params.remember);
}

export function persistRefreshedAccessToken(token: string): void {
  const mode = resolveSessionStorageMode();
  const targetStorage = getStorage(mode);
  const secondaryStorage = getStorage(mode === 'local' ? 'session' : 'local');

  secondaryStorage.removeItem(localStorageKeys.ACCESS_TOKEN);
  targetStorage.setItem(localStorageKeys.ACCESS_TOKEN, token);
}

export function clearAuthSession(): void {
  removeFromAllStorages(localStorageKeys.ACCESS_TOKEN);
  removeFromAllStorages(localStorageKeys.USER_DATA);
  removeFromAllStorages(localStorageKeys.ACTIVE_TENANT_ID);
}

export function setStoredActiveTenantId(tenantId: string): void {
  const mode = resolveSessionStorageMode();
  const targetStorage = getStorage(mode);
  const secondaryStorage = getStorage(mode === 'local' ? 'session' : 'local');

  secondaryStorage.removeItem(localStorageKeys.ACTIVE_TENANT_ID);
  targetStorage.setItem(localStorageKeys.ACTIVE_TENANT_ID, tenantId);
}
