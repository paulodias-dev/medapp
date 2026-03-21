/* eslint-disable react-refresh/only-export-components */
import { localStorageKeys } from '@/app/config/local-storage-keys';
import { AuthProps, SwitchTenantResponse } from '@/app/models';
import { api } from '@/app/services';
import { clientService } from '@/app/services/client';
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
  signIn: (props: AuthProps) => Promise<void>;
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
      const rawUser = localStorage.getItem(localStorageKeys.USER_DATA);
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

  const persistAuthSession = useCallback(
    (props: { id: number; name: string; email: string; api_token: string }) => {
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

      localStorage.setItem(localStorageKeys.USER_DATA, JSON.stringify(userData));
      localStorage.setItem(localStorageKeys.ACCESS_TOKEN, props.api_token);
      localStorage.setItem(localStorageKeys.ACTIVE_TENANT_ID, String(props.id));
      api.defaults.headers.Authorization = `Bearer ${props.api_token}`;
    },
    []
  );

  const signIn = useCallback(async (params: AuthProps) => {
    const props = await clientService.auth(params);

    if (!props) {
      toast.error('Falha na autenticação');
      throw new Error('Authentication failed: props is null');
    }

    persistAuthSession(props);
  }, [persistAuthSession]);

  const switchTenant = useCallback(
    async (tenantId: number | string): Promise<SwitchTenantResponse> => {
      const response = await clientService.tenant.switchTenant(tenantId);
      persistAuthSession(response);
      return response;
    },
    [persistAuthSession]
  );

  const signOut = useCallback(() => {
    const token = localStorage.getItem(localStorageKeys.ACCESS_TOKEN);

    if (token && !checkTokenExpiration(token)) {
      void clientService.logout().catch(() => undefined);
    }

    setUser(null);
    setToken(null);
    setIsTokenExpired(true);
    setIsAuth(false);
    setIsAuthReady(true);
    localStorage.removeItem(localStorageKeys.USER_DATA);
    localStorage.removeItem(localStorageKeys.ACCESS_TOKEN);
    localStorage.removeItem(localStorageKeys.ACTIVE_TENANT_ID);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(localStorageKeys.ACCESS_TOKEN);

    if (!token || checkTokenExpiration(token)) {
      signOut();
      setIsAuthReady(true);
      return;
    }

    setToken(token);
    setIsTokenExpired(false);
    setIsAuth(true);
    api.defaults.headers.Authorization = `Bearer ${token}`;

    if (!localStorage.getItem(localStorageKeys.ACTIVE_TENANT_ID) && user?.id) {
      localStorage.setItem(localStorageKeys.ACTIVE_TENANT_ID, String(user.id));
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
