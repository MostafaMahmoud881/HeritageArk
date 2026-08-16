'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Role, Permission } from '@heritageverse/auth';
import { hasPermission, hasRole } from '@heritageverse/auth';

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => void;
  loginWithMicrosoft: () => void;
  loginWithApple: () => void;
  can: (permission: Permission) => boolean;
  hasMinimumRole: (role: Role) => boolean;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('heritageverse_access_token');
}

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('heritageverse_access_token', accessToken);
  localStorage.setItem('heritageverse_refresh_token', refreshToken);
}

function clearTokens() {
  localStorage.removeItem('heritageverse_access_token');
  localStorage.removeItem('heritageverse_refresh_token');
  localStorage.removeItem('heritageverse_user');
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('heritageverse_refresh_token');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
    const csrfMatch = typeof document !== 'undefined' && document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
    const csrfToken = csrfMatch ? csrfMatch[1] : undefined;
    if (csrfToken) headers.set('x-csrf-token', csrfToken);
  }

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      res = await fetch(url, { ...options, headers });
    }
  }

  return res;
}

async function apiLogin(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(err.error);
  }
  return res.json();
}

async function apiRegister(name: string, email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Registration failed' }));
    throw new Error(err.error);
  }
  return res.json();
}

async function apiLogout(): Promise<void> {
  const accessToken = getAccessToken();
  if (!accessToken) return;
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const stored = localStorage.getItem('heritageverse_user');
    if (stored) {
      try {
        setState({ user: JSON.parse(stored), isLoading: false, error: null });
      } catch {
        setState({ user: null, isLoading: false, error: null });
      }
    } else {
      setState({ user: null, isLoading: false, error: null });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const { user, accessToken, refreshToken } = await apiLogin(email, password);
      setTokens(accessToken, refreshToken);
      localStorage.setItem('heritageverse_user', JSON.stringify(user));
      setState({ user, isLoading: false, error: null });
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message }));
      throw err;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const { user, accessToken, refreshToken } = await apiRegister(name, email, password);
      setTokens(accessToken, refreshToken);
      localStorage.setItem('heritageverse_user', JSON.stringify(user));
      setState({ user, isLoading: false, error: null });
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore logout API errors
    }
    clearTokens();
    setState({ user: null, isLoading: false, error: null });
  }, []);

  const can = useCallback((permission: Permission) => {
    if (!state.user) return false;
    return hasPermission(state.user.role, permission);
  }, [state.user]);

  const hasMinimumRole = useCallback((role: Role) => {
    if (!state.user) return false;
    return hasRole(state.user.role, role);
  }, [state.user]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setState(s => {
      if (!s.user) return s;
      const updated = { ...s.user, ...updates };
      localStorage.setItem('heritageverse_user', JSON.stringify(updated));
      return { ...s, user: updated };
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      loginWithGoogle: () => {
        const redirectUri = `${window.location.origin}/api/auth/oauth/callback`;
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;
      },
      loginWithMicrosoft: () => {
        const redirectUri = `${window.location.origin}/api/auth/oauth/callback`;
        window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=user.read`;
      },
      loginWithApple: () => {
        const redirectUri = `${window.location.origin}/api/auth/oauth/callback`;
        window.location.href = `https://appleid.apple.com/auth/authorize?client_id=${process.env.NEXT_PUBLIC_APPLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=name%20email`;
      },
      can,
      hasMinimumRole,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { getAccessToken, refreshAccessToken };
