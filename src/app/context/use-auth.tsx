/* eslint-disable react-refresh/only-export-components */
import { localStorageKeys } from '@/app/config/local-storage-keys';
import { AuthProps } from '@/app/models';
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
  tenant: Tenant | null;
  tenants: Tenant[] | [];
  token: string | null;
  signIn: (props: AuthProps) => Promise<void>;
  signOut: () => void;
  switchTenant: (id: number) => Promise<void>;
  isTokenExpired: boolean;
  isAuth: boolean;
  isLoading: boolean;
};

type User = {
  id: number;
  name: string;
  email: string;
  type: string;
};

type Tenant = {
  id: number;
  name: string;
  name_fantasy: string;
  img: string | null;
  branch_id: number;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(localStorageKeys.USER_DATA);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTenants = useCallback(async () => {
    try {
      const data = await clientService.listTenants();
      setTenants(data);
    } catch (error) {
      console.error('Failed to fetch tenants', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (params: AuthProps) => {
    const props = await clientService.auth(params);

    if (!props) {
      toast.error('Falha na autenticação');
      throw new Error('Authentication failed: props is null');
    }

    const userData = {
      id: props.id,
      name: props.name,
      email: props.email,
      type: 'client', // Default for client sign-in
    };

    setUser(userData);
    setToken(props.api_token);

    localStorage.setItem(localStorageKeys.USER_DATA, JSON.stringify(userData));
    localStorage.setItem(localStorageKeys.ACCESS_TOKEN, props.api_token);
    api.defaults.headers.Authorization = `Bearer ${props.api_token}`;

    setIsLoading(true);
    await fetchTenants();

    // Fetch tenant info
    const data = await clientService.verifyToken();
    setTenant({
      id: data.id,
      name: data.name,
      name_fantasy: data.name_fantasy,
      img: data.img,
      branch_id: data.branch_id,
    });

    setIsAuth(true);
    setIsLoading(false);
  }, [fetchTenants]);

  const signOut = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsTokenExpired(true);
    setIsAuth(false);
    localStorage.removeItem(localStorageKeys.USER_DATA);
    localStorage.removeItem(localStorageKeys.ACCESS_TOKEN);
    setTenants([]);
  }, []);

  const switchTenant = useCallback(async (id: number) => {
    try {
      const data = await clientService.switchTenant(id);
      
      setToken(data.api_token);
      localStorage.setItem(localStorageKeys.ACCESS_TOKEN, data.api_token);
      api.defaults.headers.Authorization = `Bearer ${data.api_token}`;
      
      // Refresh user and tenant info
      const profile = await clientService.verifyToken();
      setTenant({
        id: profile.id,
        name: profile.name,
        name_fantasy: profile.name_fantasy,
        img: profile.img,
        branch_id: profile.branch_id,
      });

      toast.success(`Empresa alterada para: ${profile.name_fantasy}`);
    } catch (error) {
      toast.error('Falha ao trocar de empresa');
      throw error;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(localStorageKeys.ACCESS_TOKEN);

    if (!token || checkTokenExpiration(token)) {
      signOut();
      setIsLoading(false); // Ensure loading is false if sign out occurs
      return;
    }

    setToken(token);
    setIsAuth(true);
    api.defaults.headers.Authorization = `Bearer ${token}`;

    clientService.verifyToken().then((data) => {
      setUser({
        id: data.user_id,
        name: data.name,
        email: data.email,
        type: data.type,
      });
      setTenant({
        id: data.id,
        name: data.name,
        name_fantasy: data.name_fantasy,
        img: data.img,
        branch_id: data.branch_id,
      });
    }).finally(() => {
      fetchTenants(); // Fetch tenants after verifying token
    });
  }, [signOut, fetchTenants]);

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        tenants,
        token,
        signIn,
        signOut,
        switchTenant,
        isTokenExpired,
        isAuth,
        isLoading,
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
