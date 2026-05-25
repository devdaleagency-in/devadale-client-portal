import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { setAuthToken, getAuthToken, clearAuthToken } from '../../utils/api';
import { connectSocket, disconnectSocket } from '../../services/chat/socket';

const REFRESH_KEY = 'devdale-refresh-token';

let _initialized = false;

function getRefreshToken(): string | null {
  try { return localStorage.getItem(REFRESH_KEY); } catch { return null; }
}

function setRefreshToken(token: string | null) {
  try {
    if (token) localStorage.setItem(REFRESH_KEY, token);
    else localStorage.removeItem(REFRESH_KEY);
  } catch {}
}

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout: clearStore } = useAuthStore();
  const navigate = useNavigate();

  const initialize = useCallback(async () => {
    const accessToken = getAuthToken();
    const refreshToken = getRefreshToken();

    if (!accessToken && !refreshToken) {
      setLoading(false);
      return;
    }

    if (accessToken) {
      try {
        const { user } = await authService.getMe();
        setUser(user);
        connectSocket(accessToken);
        return;
      } catch {
        // token expired, try refresh
      }
    }

    if (refreshToken) {
      try {
        const tokens = await authService.refreshToken(refreshToken);
        setAuthToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
        const { user } = await authService.getMe();
        setUser(user);
        connectSocket(tokens.accessToken);
        return;
      } catch {
        // both tokens expired
        clearAuthToken();
        setRefreshToken(null);
        setLoading(false);
      }
    }

    setLoading(false);
  }, [setUser, setLoading]);

  useEffect(() => {
    if (_initialized) return;
    _initialized = true;
    initialize();
  }, [initialize]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    setAuthToken(result.tokens.accessToken);
    setRefreshToken(result.tokens.refreshToken);
    setUser(result.user);
    connectSocket(result.tokens.accessToken);
    return result.user;
  }, [setUser]);

  const register = useCallback(async (name: string, username: string, email: string, password: string, role?: string) => {
    const result = await authService.register(name, username, email, password, role);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await authService.logout(refreshToken).catch(() => {});
    }
    clearAuthToken();
    setRefreshToken(null);
    disconnectSocket();
    clearStore();
    navigate('/login');
  }, [clearStore, navigate]);

  const refreshToken = useCallback(async () => {
    const rt = getRefreshToken();
    if (!rt) throw new Error('No refresh token');
    const tokens = await authService.refreshToken(rt);
    setAuthToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    return tokens;
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };
}
