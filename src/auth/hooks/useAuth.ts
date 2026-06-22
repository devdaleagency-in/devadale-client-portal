import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { setAuthToken, getAuthToken, clearAuthToken } from '../../utils/api';
import { connectSocket, disconnectSocket } from '../../services/chat/socket';

const REFRESH_KEY = 'devdale-refresh-token';

let _initialized = false;


export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout: clearStore } = useAuthStore();
  const navigate = useNavigate();

  const initialize = useCallback(async () => {
    const accessToken = getAuthToken();


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

    // Refresh relies on httpOnly cookie, so if no accessToken, we try to refresh once
    try {
      const tokens = await authService.refreshToken();
      setAuthToken(tokens.accessToken);
      const { user } = await authService.getMe();
      setUser(user);
      connectSocket(tokens.accessToken);
      return;
    } catch {
      clearAuthToken();
      setLoading(false);
    }
  }, [setUser, setLoading]);

  useEffect(() => {
    if (_initialized) return;
    _initialized = true;
    initialize();
  }, [initialize]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    setAuthToken(result.tokens.accessToken);
    
    setUser(result.user);
    connectSocket(result.tokens.accessToken);
    return result.user;
  }, [setUser]);

  const register = useCallback(async (name: string, username: string, email: string, password: string, role?: string) => {
    const result = await authService.register(name, username, email, password, role);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {});
    clearAuthToken();
    
    disconnectSocket();
    clearStore();
    navigate('/login');
  }, [clearStore, navigate]);

  const refreshToken = useCallback(async () => {
    const tokens = await authService.refreshToken();
    setAuthToken(tokens.accessToken);
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
