import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiFetch, setStoredToken, getStoredToken } from '../lib/api';
import type { ApiUser, AuthSession } from '../types/api';

type LoginPayload = { email: string; password: string };
type RegisterPayload = LoginPayload & { firstName: string; lastName: string; phone?: string };

type AuthContextValue = {
  user: ApiUser | null;
  isReady: boolean;
  login: (payload: LoginPayload) => Promise<ApiUser>;
  register: (payload: RegisterPayload) => Promise<ApiUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!getStoredToken()) {
      setIsReady(true);
      return;
    }

    apiFetch<ApiUser>('/auth/me')
      .then(setUser)
      .catch(() => setStoredToken(null))
      .finally(() => setIsReady(true));
  }, []);

  const persistSession = (session: AuthSession) => {
    setStoredToken(session.accessToken);
    setUser(session.user);
    return session.user;
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isReady,
    login: async (payload) => persistSession(await apiFetch<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify(payload) })),
    register: async (payload) => persistSession(await apiFetch<AuthSession>('/auth/register', { method: 'POST', body: JSON.stringify(payload) })),
    logout: () => {
      setStoredToken(null);
      setUser(null);
    },
  }), [isReady, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider.');
  }
  return context;
}
