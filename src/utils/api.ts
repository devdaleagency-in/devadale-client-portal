const API_BASE = '/api';

let authToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

const TOKEN_KEY = 'devdale-api-token';

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    try { sessionStorage.setItem(TOKEN_KEY, token); } catch {}
  } else {
    try { sessionStorage.removeItem(TOKEN_KEY); } catch {}
  }
}

export function clearAuthToken() {
  authToken = null;
  try { sessionStorage.removeItem(TOKEN_KEY); } catch {}
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = (() => {
      try { return localStorage.getItem('devdale-refresh-token'); } catch { return null; }
    })();
    if (!refreshToken) return false;

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    setAuthToken(data.accessToken);
    try { localStorage.setItem('devdale-refresh-token', data.refreshToken); } catch {}
    return true;
  } catch {
    return false;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && !path.includes('/auth/refresh')) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;
    if (refreshed) {
      const newToken = getAuthToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        const retryRes = await fetch(`${API_BASE}${path}`, { ...options, headers });
        if (retryRes.ok) return retryRes.json();
      }
    }

    clearAuthToken();
    try {
      localStorage.removeItem('devdale-refresh-token');
      sessionStorage.removeItem('devdale-role');
      sessionStorage.removeItem('devdale-access-granted');
    } catch {}
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const errBody = await res.text();
    let errorMessage: string;
    try {
      const parsed = JSON.parse(errBody);
      errorMessage = parsed.error || `HTTP ${res.status}`;
    } catch {
      errorMessage = errBody || `HTTP ${res.status}`;
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export const api = {
  request: <T>(path: string, options?: RequestInit) => request<T>(path, options),

  login: (email: string, role?: string) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    }),

  loginAdmin: () =>
    request<{ token: string; user: any }>('/auth/login-admin', { method: 'POST' }),

  getMe: () => request<{ user: any; role: string }>('/me'),

  getProjects: () => request<any[]>('/projects'),

  addProject: (project: any) =>
    request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    }),

  getAgreements: () => request<any[]>('/agreements'),

  addAgreement: (agreement: any) =>
    request<any>('/agreements', {
      method: 'POST',
      body: JSON.stringify(agreement),
    }),

  signAgreement: () =>
    request<{ msaStatus: string; agreements: any[]; metrics: any; activity: any[] }>(
      '/agreements/sign',
      { method: 'POST' }
    ),

  getActivity: () => request<any[]>('/activity'),

  getMetrics: () => request<any>('/metrics'),

  getMsaStatus: () => request<{ msaStatus: string }>('/msa-status'),

  getMessages: () => request<any[]>('/messages'),

  sendMessage: (text: string) =>
    request<any>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ sender: 'user', text }),
    }),

  postMessage: (text: string, sender: string) =>
    request<any>('/messages', {
      method: 'POST',
      body: JSON.stringify({ sender, text }),
    }),

  chat: (message: string, projectName?: string) =>
    request<{ reply: string; message?: any }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, projectName }),
    }),

  summarize: () => request<{ summary: string }>('/summarize', { method: 'POST' }),

  uploadFiles: (formData: FormData) =>
    request<any[]>('/files/upload', {
      method: 'POST',
      body: formData,
    }),

  updateAvatar: (formData: FormData) =>
    request<{ user: any }>('/users/me/avatar', {
      method: 'POST',
      body: formData,
    }),

  removeAvatar: () =>
    request<{ user: any }>('/users/me/avatar', {
      method: 'DELETE',
    }),

  getFiles: () => request<any[]>('/files'),

  createOnboardingLink: (data: { clientName: string; organization: string; phone: string; email: string; expiresAt: string }) =>
    request<any>('/admin/onboarding-link', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyOnboardingLink: (token: string) =>
    request<{ valid: boolean; clientName: string; organization: string; email: string }>(`/onboarding/verify/${token}`),

  consumeOnboardingLink: (token: string) =>
    request<{ message: string; clientName: string; email: string }>(`/onboarding/consume/${token}`, { method: 'POST' }),

  getPortalStatus: () => request<{ clientPortalEnabled: boolean }>('/portal-status'),

  getSettings: () => request<any>('/settings'),

  updateClientPortal: (enabled: boolean) =>
    request<any>('/settings/client-portal', {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    }),

  updateWhiteLabel: (enabled: boolean) =>
    request<any>('/settings/white-label', {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    }),

  generateSummary: () =>
    request<any>('/summaries/generate', { method: 'POST' }),

  getSummaries: () => request<any[]>('/summaries'),

  getSummary: (id: string) => request<any>(`/summaries/${id}`),

  exportSummaryPdf: (id: string) =>
    request<{ success: boolean; content: string; filename: string }>(`/summaries/${id}/export-pdf`, { method: 'POST' }),

  sendSummaryEmail: (id: string, email: string) =>
    request<{ success: boolean; message: string; emailPreview?: string }>(`/summaries/${id}/send-email`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  reset: () => request<{ message: string; db: any }>('/reset', { method: 'POST' }),
};
