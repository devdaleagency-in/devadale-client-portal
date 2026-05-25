export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'onboarding';
  avatarUrl: string;
  title: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterResponse {
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Session {
  tokenId: string;
  userAgent: string;
  ip: string;
  lastActivity: string;
  createdAt: string;
}
