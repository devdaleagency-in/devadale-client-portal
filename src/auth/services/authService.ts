import { api } from '../../utils/api';
import type { LoginResponse, RegisterResponse, AuthUser, Session } from '../types/auth';

export const authService = {
  login: (email: string, password: string) =>
    api.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, username: string, email: string, password: string, role?: string) =>
    api.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, username, email, password, role }),
    }),

  refreshToken: (refreshToken: string) =>
    api.request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  logout: (refreshToken: string) =>
    api.request<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }).catch(() => ({ message: 'logged out' })),

  logoutAll: () =>
    api.request<{ message: string }>('/auth/logout-all', {
      method: 'POST',
    }),

  getMe: () =>
    api.request<{ user: AuthUser }>('/auth/me'),

  getSessions: () =>
    api.request<Session[]>('/auth/sessions'),

  revokeSession: (tokenId: string) =>
    api.request<{ message: string }>(`/auth/sessions/${tokenId}`, {
      method: 'DELETE',
    }),

  forgotPassword: (email: string) =>
    api.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    api.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),

  verifyEmail: (token: string) =>
    api.request<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  updateProfile: (data: { name?: string; title?: string }) =>
    api.request<{ user: AuthUser }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
