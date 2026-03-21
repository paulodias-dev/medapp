import { localStorageKeys } from '@/app/config/local-storage-keys';
import { useAuth } from '@/app/context/use-auth';
import { useEffect } from 'react';

function parseTenantId(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function useTenantGuard(): void {
  const { isAuth, isAuthReady, user } = useAuth();

  useEffect(() => {
    if (!isAuthReady || !isAuth || !user?.id) {
      return;
    }

    const activeTenantId = parseTenantId(
      localStorage.getItem(localStorageKeys.ACTIVE_TENANT_ID),
    );

    // Keep local tenant selection pinned to authenticated tenant
    // to avoid stale/tampered localStorage state across sessions.
    if (!activeTenantId || activeTenantId !== user.id) {
      localStorage.setItem(localStorageKeys.ACTIVE_TENANT_ID, String(user.id));
    }
  }, [isAuth, isAuthReady, user?.id]);
}
