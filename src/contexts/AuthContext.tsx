import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiJson } from '../lib/apiClient';

interface AuthUser {
  username: string;
}

interface CheckAuthResponse {
  authenticated: boolean;
  user?: AuthUser;
}

interface LoginResponse {
  authenticated: boolean;
  user?: AuthUser;
  message?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      const data = await apiJson<CheckAuthResponse>('/check-auth.php', { method: 'GET' });
      setUser(data.authenticated ? data.user ?? { username: 'admin' } : null);
    } catch (e) {
      // If the API is unreachable or returns invalid JSON, treat as logged out.
      console.warn('check-auth failed', e);
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await refreshAuth();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const data = await apiJson<LoginResponse>('/login.php', {
        method: 'POST',
        body: { username, password },
      });

      if (!data.authenticated) {
        return { error: new Error(data.message || 'Login failed') };
      }

      setUser(data.user ?? { username });
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  };

  const signOut = async () => {
    try {
      await apiJson<{ authenticated: false }>('/logout.php', { method: 'POST' });
    } catch (e) {
      // Even if logout fails, clear local state
      console.warn('logout failed', e);
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
