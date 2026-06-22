import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import GlobalSearch from '../components/GlobalSearch';
import NotificationCenter from '../components/notifications/NotificationCenter';
import ClientSidebar from '../components/ClientSidebar';
import MobileSidebar from '../components/MobileSidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import ClientConsole from '../components/ClientConsole';
import NewProjectModal from '../components/NewProjectModal';
import UploadFilesModal from '../components/UploadFilesModal';
import RevisionRequestModal from '../components/RevisionRequestModal';
import MeetingSchedulerModal from '../components/MeetingSchedulerModal';
import SupportChatDrawer from '../components/SupportChatDrawer';
import OtherTabViews from '../components/OtherTabViews';
import { api } from '../utils/api';
import { Project, Agreement, ActivityFeed, User, AppNotification } from '../types';

interface ClientPortalProps {
  currentRole: 'admin' | 'client' | 'onboarding';
  setRole: (role: 'admin' | 'client' | 'onboarding') => void;
  currentUser: User | null;
  notifications: AppNotification[];
  setNotifications: Dispatch<SetStateAction<AppNotification[]>>;
  toast: { id: string; msg: string; type: 'success' | 'info' | 'critical' } | null;
  setToast: Dispatch<SetStateAction<{ id: string; msg: string; type: 'success' | 'info' | 'critical' } | null>>;
  isLoading: boolean;
  handleSignOut: () => void;
  handleUpdateAvatar: (file: File) => Promise<void>;
  handleRemoveAvatar: () => Promise<void>;
  handleMarkNotificationRead: (id: string) => void;
  handleMarkAllNotificationsRead: () => void;
  handleApproveNotification: (id: string) => void;
  handleRejectNotification: (id: string) => void;
  handlePreviewNotification: (id: string) => void;
  handleDownloadNotification: (id: string) => void;
  handleNotificationAction: (id: string, action: string) => void;
  triggerToast: (msg: string, type?: 'success' | 'info' | 'critical') => void;
  fetchNotifications: () => Promise<void>;
}

const clientTabFromPath: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/timeline': 'timeline',
  '/messages': 'messages',
  '/agreements': 'agreements',
  '/deliverables': 'deliverables',
  '/invoices': 'invoices',
  '/notifications': 'notifications',
  '/support': 'support',
  '/profile': 'profile',
};

export default function ClientPortal({
  currentRole, setRole,
  currentUser, notifications, setNotifications,
  toast, setToast, isLoading,
  handleSignOut, handleUpdateAvatar, handleRemoveAvatar,
  handleMarkNotificationRead, handleMarkAllNotificationsRead,
  handleApproveNotification, handleRejectNotification,
  handlePreviewNotification, handleDownloadNotification,
  handleNotificationAction, triggerToast,
  fetchNotifications,
}: ClientPortalProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTab = clientTabFromPath[location.pathname] || 'dashboard';
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  // Client-specific data state (isolated from admin)
  const [projects, setProjects] = useState<Project[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [activity, setActivity] = useState<ActivityFeed[]>([]);
  const [metrics, setMetrics] = useState<any>({ activeProjects: 0, pendingApprovals: 0, teamProductivity: 0, monthlyRevenue: 0 });
  const [msaStatus, setMsaStatus] = useState<'signed' | 'pending' | 'draft'>('pending');
  const [dataError, setDataError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
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
      console.error('Failed to fetch client data:', err);
      setDataError('Unable to load dashboard data. Please check your connection and try again.');
    } finally {
      setDataLoading(false);
    }
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    const tab = clientTabFromPath[location.pathname];
    if (tab && tab !== currentTab) {
      setCurrentTab(tab);
    }
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    const path = `/${tab}`;
    if (location.pathname !== path) {
      navigate(path, { replace: true });
    }
  };

  const effectiveRole = currentRole === 'client' ? 'client' : (currentRole === 'admin' ? 'admin' : 'client');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-150" id="client-portal">
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300 max-w-sm w-full px-4">
          <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-2xl ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white border-emerald-400'
              : toast.type === 'critical'
              ? 'bg-red-600 text-white border-red-500'
              : 'bg-blue-600 text-white border-blue-500'
          }`}>
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="font-bold text-xs flex-1">{toast.msg}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-white hover:opacity-80 font-bold p-1 leading-none text-sm"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <ClientSidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          handleTabChange(tab);
          setIsMobileSidebarOpen(false);
        }}
        unreadCount={notifications.filter((n) => !n.read).length}
      />

      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        currentRole="client"
        onNewProjectClick={() => setIsNewProjectModalOpen(true)}
      />

      <MobileBottomNav
        currentTab={currentTab}
        onTabChange={handleTabChange}
        unreadNotifications={notifications.filter((n) => !n.read).length}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
      />

      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        <Header
          currentTab={currentTab}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          onSignOut={handleSignOut}
          currentRole="client"
          currentUser={currentUser}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onToggleSupport={() => setIsSupportOpen(prev => !prev)}
          setRole={setRole}
          onQuickAction={() => setIsNewProjectModalOpen(true)}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onApproveNotification={handleApproveNotification}
          onRejectNotification={handleRejectNotification}
          onPreviewNotification={handlePreviewNotification}
          onDownloadNotification={handleDownloadNotification}
          onNotificationAction={handleNotificationAction}
          onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
          onQuickActionItem={(action) => {
            switch (action) {
              case 'upload':
                setShowUploadModal(true);
                break;
              case 'revision':
                setShowRevisionModal(true);
                break;
              case 'meeting':
                setShowMeetingModal(true);
                break;
              case 'message':
                handleTabChange('messages');
                break;
            }
          }}
        />

        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto pb-20 md:pb-6">
          {currentTab === 'dashboard' && (
            <ClientConsole
              loading={dataLoading || isLoading}
              error={dataError}
              projects={projects}
              activity={activity}
              agreements={agreements}
              msaStatus={msaStatus}
              onSignAgreement={() => {}}
              onTriggerAction={(msg) => triggerToast(msg, 'info')}
              onNewProjectClick={() => setIsNewProjectModalOpen(true)}
              currentUser={currentUser}
              onUpdateAvatar={handleUpdateAvatar}
              onRemoveAvatar={handleRemoveAvatar}
              onOpenMessages={() => handleTabChange('messages')}
              onViewRoadmap={() => handleTabChange('timeline')}
              onOpenSupportchat={() => setIsSupportOpen(true)}
              onOpenUploadModal={() => setShowUploadModal(true)}
              onOpenRevisionModal={() => setShowRevisionModal(true)}
              onOpenMeetingModal={() => setShowMeetingModal(true)}
            />
          )}

          <OtherTabViews
            currentTab={currentTab}
            currentRole="client"
            projects={projects}
            agreements={agreements}
            msaStatus={msaStatus}
            onSignAgreement={() => {}}
            onNewProjectClick={() => setIsNewProjectModalOpen(true)}
            onTriggerAction={(msg) => triggerToast(msg, 'info')}
            metrics={metrics}
            onResetData={async () => {}}
            currentUser={currentUser}
            onUpdateAvatar={handleUpdateAvatar}
            onRemoveAvatar={handleRemoveAvatar}
            notifications={notifications}
            unreadCount={notifications.filter((n) => !n.read).length}
            onMarkNotificationRead={handleMarkNotificationRead}
            onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
            onApproveNotification={handleApproveNotification}
            onRejectNotification={handleRejectNotification}
            onPreviewNotification={handlePreviewNotification}
            onDownloadNotification={handleDownloadNotification}
            onNotificationAction={handleNotificationAction}
          />
        </main>
      </div>

      {isSupportOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsSupportOpen(false)}
          />
          <SupportChatDrawer
            projectName={projects.find(p => p.id === 'proj-focus')?.name || 'DevDale Agency'}
            onClose={() => setIsSupportOpen(false)}
            onTriggerNotification={(m) => triggerToast(m, 'info')}
            currentUser={currentUser}
          />
        </>
      )}

      {isNewProjectModalOpen && (
        <NewProjectModal
          onClose={() => setIsNewProjectModalOpen(false)}
          onSubmit={async () => {}}
        />
      )}

      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        projects={projects}
        agreements={agreements}
        activity={activity}
        onNavigate={handleTabChange}
        onTriggerAction={(msg) => triggerToast(msg, 'info')}
      />

      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onApprove={handleApproveNotification}
        onReject={handleRejectNotification}
        onPreview={handlePreviewNotification}
        onDownload={handleDownloadNotification}
        onAction={handleNotificationAction}
      />

      <UploadFilesModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={(files) => {
          triggerToast(`${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully`, 'success');
        }}
      />
      <RevisionRequestModal
        isOpen={showRevisionModal}
        onClose={() => setShowRevisionModal(false)}
        projects={projects}
      />
      <MeetingSchedulerModal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
      />
    </div>
  );
}
