import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import BrandLogo from './components/BrandLogo';
import AdminPortal from './portals/AdminPortal';
import ClientPortal from './portals/ClientPortal';
import LoginPage from './auth/pages/LoginPage';
import RegisterPage from './auth/pages/RegisterPage';
import ForgotPasswordPage from './auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './auth/pages/ResetPasswordPage';
import VerifyEmailPage from './auth/pages/VerifyEmailPage';
import UnauthorizedPage from './auth/pages/UnauthorizedPage';
import PortalDisabledPage from './auth/pages/PortalDisabledPage';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import { useAuthStore } from './auth/store/authStore';
import { useAuth } from './auth/hooks/useAuth';
import { OnboardingData, OnboardingLinkRequest, OnboardingLinkResponse, User, AppNotification } from './types';
import { api } from './utils/api';
import { useBrandingStore } from './store/brandingStore';
import { mapBackendNotifications } from './utils/notificationMapper';

export default function App() {
  const [currentRole, setRole] = useState<'super_admin' | 'admin' | 'client' | 'team_member' | 'onboarding'>('admin');
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const authUser = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const { logout: authLogout } = useAuth();

  const initialRedirect = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !initialRedirect.current) {
      initialRedirect.current = true;
      if (authUser?.role === 'admin' || authUser?.role === 'super_admin' || authUser?.role === 'team_member') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, authUser, navigate]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (isAuthenticated && authUser) {
      setRole(authUser.role as 'super_admin' | 'admin' | 'client' | 'team_member');
      setCurrentUser({
        id: authUser._id,
        name: authUser.name,
        email: authUser.email,
        role: authUser.role as 'super_admin' | 'admin' | 'client' | 'team_member',
        avatarUrl: authUser.avatarUrl,
        title: authUser.title,
      });
      setIsLoading(false);

      if (authUser.role === 'client') {
        api.getPortalStatus().then((status) => {
          if (!status.clientPortalEnabled) {
            handleSignOut();
            navigate('/portal-disabled', { replace: true });
          }
        }).catch(() => {});
      }
    } else if (isAuthenticated === false) {
      setIsLoading(false);
    }
  }, [isAuthenticated, authUser]);

  const brandingConfig = useBrandingStore((s) => s.config);
  const loadBranding = useBrandingStore((s) => s.load);
  const loadFromServer = useBrandingStore((s) => s.loadFromServer);
  useEffect(() => {
    loadBranding('default');
    loadFromServer();
  }, [loadBranding, loadFromServer]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-accent', brandingConfig.colors.accent);
    root.style.setProperty('--brand-accent-hover', brandingConfig.colors.accentHover);
    root.style.setProperty('--brand-accent-light', brandingConfig.colors.accentLight);
    root.style.setProperty('--brand-accent-dark', brandingConfig.colors.accentDark);
    if (brandingConfig.logo.url) {
      root.style.setProperty('--brand-logo-url', `url(${brandingConfig.logo.url})`);
    }

    if (brandingConfig.whiteLabelEnabled) {
      document.title = brandingConfig.workspaceName ? `${brandingConfig.workspaceName} Portal` : 'Client Portal';
      if (brandingConfig.logo.faviconUrl) {
        let link = document.querySelector('link[rel*="icon"]') as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = brandingConfig.logo.faviconUrl;
      }
    } else {
      document.title = 'DevDale Agency – Client Workspace';
      const link = document.querySelector('link[rel*="icon"]') as HTMLLinkElement;
      if (link && !link.href.includes('devdale')) {
        link.href = '/favicon.ico';
      }
    }
  }, [brandingConfig]);

  const [toast, setToast] = useState<{ id: string; msg: string; type: 'success' | 'info' | 'critical' } | null>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const [raw, { count }] = await Promise.all([
        api.getNotifications(),
        api.getUnreadCount(),
      ]);
      setNotifications(mapBackendNotifications(raw));
      setUnreadCount(count);
    } catch {
      // Notifications are non-critical; fail silently
    }
  }, []);

  const handleMarkNotificationRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await api.markNotificationRead(id);
    } catch { /* optimistic update */ }
  }, []);

  const handleMarkAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.markAllNotificationsRead();
    } catch { /* optimistic update */ }
    triggerToast('All notifications marked as read.', 'info');
  }, []);

  const handleApproveNotification = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, actionable: false, actionType: undefined } : n)),
    );
    await api.markNotificationRead(id).catch(() => {});
    triggerToast('Item approved successfully.', 'success');
  }, []);

  const handleRejectNotification = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, actionable: false, actionType: undefined } : n)),
    );
    await api.markNotificationRead(id).catch(() => {});
    triggerToast('Item rejected.', 'info');
  }, []);

  const handlePreviewNotification = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    await api.markNotificationRead(id).catch(() => {});
    triggerToast('Opening preview...', 'info');
  }, []);

  const handleDownloadNotification = useCallback((_id: string) => {
    triggerToast('Download started.', 'info');
  }, []);

  const handleNotificationAction = useCallback((_id: string, action: string) => {
    triggerToast(`Action: ${action}`, 'info');
  }, []);

  const triggerToast = (msg: string, type: 'success' | 'info' | 'critical' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, msg, type });
    setTimeout(() => {
      setToast(prev => prev?.id === id ? null : prev);
    }, 4500);
  };

  const handleOnboardingComplete = async (data: OnboardingData) => {
    setRole('client');
    triggerToast(`Welcome to your workspace, ${data.companyName}! Portal fully provisioned.`, 'success');
  };

  const handleCreateOnboardingLink = async (data: OnboardingLinkRequest): Promise<OnboardingLinkResponse | null> => {
    try {
      return await api.createOnboardingLink(data);
    } catch {
      return null;
    }
  };

  const handleSignOut = () => {
    authLogout();
  };

  const handleUpdateAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { user } = await api.updateAvatar(formData);
      setCurrentUser((user as User));
      triggerToast('Profile photo updated.', 'success');
    } catch {
      setCurrentUser((prev) => prev ? { ...prev, avatarUrl: URL.createObjectURL(file) } : null);
      triggerToast('Profile photo updated (offline mode).', 'success');
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const { user } = await api.removeAvatar();
      setCurrentUser((user as User));
    } catch {
      setCurrentUser((prev) => prev ? { ...prev, avatarUrl: '' } : null);
    }
    triggerToast('Profile photo removed.', 'info');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setToast((prev) => prev ? prev : null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-center space-y-4">
          <BrandLogo dark />
          <p className="text-slate-400 text-sm animate-pulse">Loading portal...</p>
        </div>
      </div>
    );
  }

  const portalProps = {
    currentRole,
    setRole,
    currentUser,
    notifications,
    unreadCount,
    setNotifications,
    toast,
    setToast,
    isLoading,
    handleSignOut,
    handleUpdateAvatar,
    handleRemoveAvatar,
    handleCreateOnboardingLink,
    handleMarkNotificationRead,
    handleMarkAllNotificationsRead,
    handleApproveNotification,
    handleRejectNotification,
    handlePreviewNotification,
    handleDownloadNotification,
    handleNotificationAction,
    triggerToast,
    fetchNotifications,
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/portal-disabled" element={<PortalDisabledPage />} />
      
      {/* Client Routes */}
      <Route element={<RoleProtectedRoute allowedRoles={['client']} />}>
        <Route path="/dashboard" element={<ClientPortal {...portalProps} />} />
          <Route path="/timeline" element={<ClientPortal {...portalProps} />} />
        <Route path="/messages" element={<ClientPortal {...portalProps} />} />
        <Route path="/agreements" element={<ClientPortal {...portalProps} />} />
        <Route path="/deliverables" element={<ClientPortal {...portalProps} />} />
        <Route path="/invoices" element={<ClientPortal {...portalProps} />} />
        <Route path="/notifications" element={<ClientPortal {...portalProps} />} />
        <Route path="/support" element={<ClientPortal {...portalProps} />} />
        <Route path="/profile" element={<ClientPortal {...portalProps} />} />
      </Route>

      {/* Admin/Team Routes (Shared) */}
      <Route element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin', 'team_member']} />}>
        <Route path="/admin" element={<AdminPortal {...portalProps} />} />
        <Route path="/admin/projects" element={<AdminPortal {...portalProps} />} />
        <Route path="/admin/deliverables" element={<AdminPortal {...portalProps} />} />
        <Route path="/admin/messages" element={<AdminPortal {...portalProps} />} />
        <Route path="/admin/notifications" element={<AdminPortal {...portalProps} />} />
        <Route path="/admin/support" element={<AdminPortal {...portalProps} />} />
        <Route path="/admin/meetings" element={<AdminPortal {...portalProps} />} />
      </Route>

      {/* Admin Only Routes */}
      <Route element={<RoleProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
        <Route path="/admin/clients" element={<AdminPortal {...portalProps} />} />
        <Route path="/admin/analytics" element={<AdminPortal {...portalProps} />} />
        <Route path="/admin/billing" element={<AdminPortal {...portalProps} />} />
        <Route path="/admin/invoices" element={<AdminPortal {...portalProps} />} />
        <Route path="/admin/team" element={<AdminPortal {...portalProps} />} />
        <Route path="/admin/settings" element={<AdminPortal {...portalProps} />} />
        <Route path="/admin/branding" element={<AdminPortal {...portalProps} />} />
        <Route path="/admin/system" element={<AdminPortal {...portalProps} />} />
        <Route path="/admin/integrations" element={<AdminPortal {...portalProps} />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={currentRole === 'client' ? "/dashboard" : "/admin"} replace />} />
      <Route path="*" element={<Navigate to={currentRole === 'client' ? "/dashboard" : "/admin"} replace />} />
    </Routes>
  );
}
