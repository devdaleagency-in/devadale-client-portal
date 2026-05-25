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
import { useAuthStore } from './auth/store/authStore';
import { useAuth } from './auth/hooks/useAuth';
import { Project, Agreement, Metrics, ActivityFeed, OnboardingData, OnboardingLinkRequest, OnboardingLinkResponse, User, AppNotification } from './types';
import {
  INITIAL_INVOICES,
  INITIAL_UPLOADS,
  INITIAL_APPROVALS,
  INITIAL_TEAM_ACTIVITY,
  INITIAL_NOTIFICATIONS,
} from './data';
import { api } from './utils/api';
import { useBrandingStore } from './store/brandingStore';

const CLIENT_ROUTES = [
  '/dashboard', '/projects', '/timeline', '/messages',
  '/agreements', '/deliverables', '/invoices', '/notifications',
  '/support', '/team', '/meetings', '/profile',
];

function AuthenticatedRouteHandler({ portalProps }: { portalProps: any }) {
  const location = useLocation();
  const user = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isLoading = useAuthStore(s => s.isLoading);

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const path = location.pathname;
  const isAdminPath = path === '/admin' || path.startsWith('/admin/');
  const isClientPath = CLIENT_ROUTES.includes(path);
  const isAdminUser = user?.role === 'admin';

  if (isAdminPath && !isAdminUser) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (isClientPath && isAdminUser) {
    return <Navigate to="/admin" replace />;
  }

  if (path === '/' || (!isAdminPath && !isClientPath)) {
    return <Navigate to={isAdminUser ? '/admin' : '/dashboard'} replace />;
  }

  if (isAdminPath && isAdminUser) {
    return <AdminPortal {...portalProps} />;
  }

  return <ClientPortal {...portalProps} />;
}

export default function App() {
  const [currentRole, setRole] = useState<'admin' | 'client' | 'onboarding'>('admin');
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
      if (authUser?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, authUser, navigate]);

  useEffect(() => {
    if (isAuthenticated && authUser) {
      setRole(authUser.role as 'admin' | 'client');
      setCurrentUser({
        id: authUser._id,
        name: authUser.name,
        email: authUser.email,
        role: authUser.role as 'admin' | 'client',
        avatarUrl: authUser.avatarUrl,
        title: authUser.title,
      });
      setIsLoading(false);
      fetchAllData();

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

  const handleSetCurrentTab = (tab: string) => {
    navigate(`/${tab}`);
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [activity, setActivity] = useState<ActivityFeed[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ activeProjects: 0, pendingApprovals: 0, teamProductivity: 0, monthlyRevenue: 0 });
  const [msaStatus, setMsaStatus] = useState<'signed' | 'pending' | 'draft'>('pending');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [toast, setToast] = useState<{ id: string; msg: string; type: 'success' | 'info' | 'critical' } | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    triggerToast('All notifications marked as read.', 'info');
  };

  const handleApproveNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, actionable: false, actionType: undefined } : n)),
    );
    triggerToast('Item approved successfully.', 'success');
  };

  const handleRejectNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, actionable: false, actionType: undefined } : n)),
    );
    triggerToast('Item rejected.', 'info');
  };

  const handlePreviewNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    triggerToast('Opening preview...', 'info');
  };

  const handleDownloadNotification = (id: string) => {
    triggerToast('Download started.', 'info');
  };

  const handleNotificationAction = (id: string, action: string) => {
    triggerToast(`Action: ${action}`, 'info');
  };

  const triggerToast = (msg: string, type: 'success' | 'info' | 'critical' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, msg, type });
    setTimeout(() => {
      setToast(prev => prev?.id === id ? null : prev);
    }, 4500);
  };

  const fetchAllData = useCallback(async () => {
    try {
      const [projs, agrees, acts, metrs, msa] = await Promise.all([
        api.getProjects(),
        api.getAgreements(),
        api.getActivity(),
        api.getMetrics(),
        api.getMsaStatus(),
      ]);
      setProjects(projs);
      setAgreements(agrees);
      setActivity(acts);
      setMetrics(metrs);
      setMsaStatus(msa.msaStatus as 'signed' | 'pending' | 'draft');
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setDataError('Unable to load dashboard data. Please check your connection and try again.');
    }
  }, []);

  const handleAddNewProject = async (newProj: Omit<Project, 'id'>) => {
    try {
      const created = await api.addProject(newProj);
      setProjects(prev => [created, ...prev]);
      setMetrics(prev => ({ ...prev, activeProjects: prev.activeProjects + 1 }));
      setActivity(prev => [{
        id: `act-${Date.now()}`,
        message: `Allocated new project pipeline: ${newProj.name}`,
        timestamp: 'Just now',
        actor: 'Admin Console',
        type: 'approval',
      }, ...prev]);
      triggerToast(`Successfully deployed ${newProj.name} to active production sprints!`, 'success');
    } catch {
      triggerToast('Failed to create project.', 'critical');
    }
  };

  const handleSignAgreement = async () => {
    try {
      const result = await api.signAgreement();
      setMsaStatus('signed');
      setAgreements(result.agreements);
      setMetrics(result.metrics);
      setActivity(prev => [...result.activity, ...prev]);
      triggerToast("MSA authorized and digitally signed successfully!", 'success');
    } catch {
      triggerToast('Failed to sign agreement.', 'critical');
    }
  };

  const handleGenerateAgreement = async () => {
    const newAgree = {
      name: 'MSA - SwiftShop E-com Launch',
      client: 'SwiftShop E-com',
      status: 'pending',
    };
    try {
      const created = await api.addAgreement(newAgree);
      setAgreements(prev => [created, ...prev]);
      setMetrics(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals + 1 }));
      triggerToast("Generated legal MSA draft template for SwiftShop E-com.", "info");
    } catch {
      triggerToast('Failed to generate agreement.', 'critical');
    }
  };

  const handleOnboardingComplete = async (data: OnboardingData) => {
    const onboardingProj: Project = {
      id: 'proj-focus',
      name: `${data.companyName} Workspace`,
      stage: 'UI/UX Design',
      health: 'healthy',
      lastUpdated: 'Just now',
      client: data.companyName,
      iconName: 'palette',
      progress: 35,
      nextMilestone: 'UI/UX token specs layout review',
      nextMilestoneDate: 'Friday, Oct 27',
      team: [{ name: 'Sarah Chen', avatarUrl: '' }],
      description: data.description,
    };
    setProjects(prev => [onboardingProj, ...prev.filter(p => p.id !== 'proj-focus')]);
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

  const handleResetData = async () => {
    try {
      const result = await api.reset();
      setProjects(result.db.projects);
      setAgreements(result.db.agreements);
      setActivity(result.db.activity);
      setMetrics(result.db.metrics);
      setMsaStatus('pending');
      triggerToast("Database parameters fully reverted back to mock benchmarks.");
    } catch {
      triggerToast('Failed to reset data.', 'critical');
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
    projects,
    agreements,
    activity,
    metrics,
    msaStatus,
    currentUser,
    notifications,
    setNotifications,
    toast,
    setToast,
    dataError,
    isLoading,
    handleSetCurrentTab,
    handleAddNewProject,
    handleSignAgreement,
    handleGenerateAgreement,
    handleResetData,
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
      <Route path="*" element={<AuthenticatedRouteHandler portalProps={portalProps} />} />
    </Routes>
  );
}
