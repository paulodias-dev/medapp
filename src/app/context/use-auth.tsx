/* eslint-disable react-refresh/only-export-components */
import { AuthProps, SwitchTenantResponse } from '@/app/models';
import { disconnectEcho } from '@/app/realtime/echo';
import { api } from '@/app/services';
import { clientService } from '@/app/services/client';
import {
  clearAuthSession,
  getRememberMePreference,
  getStoredActiveTenantId,
  getStoredAccessToken,
  getStoredUserRaw,
  persistAuthSession as persistAuthStorageSession,
  setStoredActiveTenantId,
} from '@/app/utils/auth-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { toast } from 'sonner';

import { jwtDecode } from 'jwt-decode';

type AuthContextType = {
  user: User | null;
  token: string | null;
  signIn: (props: AuthProps, options?: { remember?: boolean }) => Promise<void>;
  switchTenant: (tenantId: number | string) => Promise<SwitchTenantResponse>;
  signOut: () => void;
  isTokenExpired: boolean;
  isAuth: boolean;
  isAuthReady: boolean;
};

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const rawUser = getStoredUserRaw();
      if (!rawUser) return null;

      const parsed = JSON.parse(rawUser) as Partial<User>;
      if (typeof parsed?.id !== 'number') return null;

      return {
        id: parsed.id,
        name: parsed.name ?? '',
        email: parsed.email ?? '',
      };
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(null);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const persistSessionState = useCallback(
    (
      props: { id: number; name: string; email: string; api_token: string },
      remember: boolean,
    ) => {
      disconnectEcho();

      const userData = {
        id: props.id,
        name: props.name,
        email: props.email,
      };

      setUser(userData);
      setToken(props.api_token);
      setIsTokenExpired(false);
      setIsAuth(true);
      setIsAuthReady(true);

      persistAuthStorageSession({
        token: props.api_token,
        userData: JSON.stringify(userData),
        activeTenantId: String(props.id),
        remember,
      });
      api.defaults.headers.Authorization = `Bearer ${props.api_token}`;
    },
    []
  );

  const signIn = useCallback(async (params: AuthProps, options?: { remember?: boolean }) => {
    const props = await clientService.auth(params);

    if (!props) {
      toast.error('Falha na autenticação');
      throw new Error('Authentication failed: props is null');
    }

    persistSessionState(props, options?.remember ?? true);
  }, [persistSessionState]);

  const switchTenant = useCallback(
    async (tenantId: number | string): Promise<SwitchTenantResponse> => {
      const response = await clientService.tenant.switchTenant(tenantId);
      persistSessionState(response, getRememberMePreference());
      return response;
    },
    [persistSessionState]
  );

  const signOut = useCallback(() => {
    disconnectEcho();

    const token = getStoredAccessToken();

    if (token && !checkTokenExpiration(token)) {
      void clientService.logout().catch(() => undefined);
    }

    setUser(null);
    setToken(null);
    setIsTokenExpired(true);
    setIsAuth(false);
    setIsAuthReady(true);
    clearAuthSession();
    delete api.defaults.headers.common.Authorization;
  }, []);

  useEffect(() => {
    const token = getStoredAccessToken();

    if (!token || checkTokenExpiration(token)) {
      signOut();
      setIsAuthReady(true);
      return;
    }

    setToken(token);
    setIsTokenExpired(false);
    setIsAuth(true);
    api.defaults.headers.Authorization = `Bearer ${token}`;

    if (user?.id && !getStoredActiveTenantId()) {
      setStoredActiveTenantId(String(user.id));
    }

    setIsAuthReady(true);
  }, [signOut, user?.id]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        signIn,
        switchTenant,
        signOut,
        isTokenExpired,
        isAuth,
        isAuthReady,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

function checkTokenExpiration(token: string) {
  if (!token) return true;

  try {
    const { exp } = jwtDecode(token) as { exp: number };
    const currentTime = Math.floor(Date.now() / 1000);
    return exp < currentTime;
  } catch (error) {
    console.error('Invalid token:', error);
    return true;
  }
}
