import { useState, useEffect } from 'react';
import {
  Project,
  Agreement,
  Metrics,
  User,
  AppNotification,
} from '../types';
import {
  CheckCircle,
  FileText,
  Plus,
  Clock3,
  AlertTriangle,
  FolderOpen,
  Receipt,
  Bell,
  LifeBuoy,
  MessageCircle,
  BarChart3,
  CheckCheck,
  Inbox,
  Calendar,
  Download,
  Send,
  Check,
  X,
} from 'lucide-react';
import EmptyState from './ui/EmptyState';
import SkeletonCard from './ui/SkeletonCard';
import BrandingSettingsPage from './branding/BrandingSettingsPage';
import Settings from './Settings';
import Profile from './Profile';
import ProgressMeter from './ProgressMeter';
import RealtimeChat from './chat/RealtimeChat';
import AdminDeliverables from './AdminDeliverables';
import ClientDeliverables from './ClientDeliverables';
import NotificationItem from './notifications/NotificationItem';
import CreateInvoiceModal from './CreateInvoiceModal';
import { api } from '../utils/api';

interface OtherTabViewsProps {
  currentTab: string;
  currentRole: 'admin' | 'client' | 'onboarding';
  projects: Project[];
  agreements: Agreement[];
  msaStatus: 'signed' | 'pending' | 'draft';
  onSignAgreement: () => void;
  onNewProjectClick: () => void;
  onTriggerAction: (msg: string) => void;
  metrics: Metrics;
  onResetData: () => void;
  currentUser: User | null;
  onUpdateAvatar?: (file: File) => void;
  onRemoveAvatar?: () => void;
  notifications?: AppNotification[];
  notificationLoading?: boolean;
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onApproveNotification?: (id: string) => void;
  onRejectNotification?: (id: string) => void;
  onPreviewNotification?: (id: string) => void;
  onDownloadNotification?: (id: string) => void;
  onNotificationAction?: (id: string, action: string) => void;
  unreadCount?: number;
}

export default function OtherTabViews({
  currentTab,
  currentRole,
  projects,
  agreements,
  msaStatus,
  onSignAgreement,
  onNewProjectClick,
  onTriggerAction,
  metrics,
  onResetData,
  currentUser,
  onUpdateAvatar,
  onRemoveAvatar,
  notifications: notificationsProp,
  notificationLoading,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onApproveNotification,
  onRejectNotification,
  onPreviewNotification,
  onDownloadNotification,
  onNotificationAction,
  unreadCount: _unreadCount,
}: OtherTabViewsProps) {
  const [signerName, setSignerName] = useState('Admin User');
  const [signerTitle, setSignerTitle] = useState('Director');
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (currentTab === 'integrations') {
      api.getIntegrations().then(setIntegrations).catch(console.error);
    } else if (currentTab === 'billing') {
      api.getSubscription().then(setSubscription).catch(console.error);
    }
  }, [currentTab]);
  
  const allMilestones = projects.flatMap(p => p.milestones || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  if (currentTab === 'timeline') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 px-2 max-w-6xl mx-auto w-full">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Project Roadmap</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Interactive pipeline with stage completion, estimated dates, delay indicators, and status badges.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 overflow-x-auto">
          {allMilestones.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3">
              <EmptyState
                icon={Calendar}
                title="No milestones yet"
                description="Milestones will appear here once your project roadmap is established."
              />
            </div>
          ) : (
            <div className="min-w-[860px] grid grid-cols-5 gap-2">
              {allMilestones.map((m, index) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onTriggerAction(`${m.label} stage selected.`)}
                className={`relative rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 ${m.status === 'completed'
                    ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10'
                    : m.status === 'active'
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/10'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${m.status === 'completed' ? 'bg-emerald-500 text-white' : m.status === 'active' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                    {index + 1}
                  </span>
                </div>
                <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 mt-3 leading-tight">{m.label}</p>
                <p className="text-[9px] font-bold text-slate-400 mt-1">{m.date}</p>
              </button>
            ))}
          </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allMilestones.slice(0, 3).map((m) => (
            <div key={m.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{m.status}</p>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mt-2">{m.label}</h3>
              <span className={`inline-flex mt-3 text-[10px] font-black rounded-full px-2 py-1 ${m.tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : m.tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                }`}>{new Date(m.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentTab === 'messages') {
    if (!currentUser) {
      return (
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
          Loading user info...
        </div>
      );
    }
    return (
      <div className="animate-in fade-in duration-300 max-w-6xl mx-auto w-full h-[650px]">
        <RealtimeChat
          currentUserId={currentUser.id}
          currentUserRole={currentRole === 'admin' ? 'admin' : 'client'}
          emptyPlaceholder="No messages yet. Start a conversation about your project!"
        />
      </div>
    );
  }

  if (currentTab === 'agreements') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 px-2 max-w-4xl mx-auto w-full">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Agreements Vault & Legal Desk</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review, sign, or create digital Master Service Agreements.</p>
        </div>

        {/* Real Sign Panel Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
          <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Master Service Agreement (MSA_brand_v2)</h3>
              <p className="text-[11px] text-slate-400 mt-1">Double Encrypted • Formulated by DevDale Governance Team</p>
            </div>

            <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${msaStatus === 'signed'
                ? 'bg-emerald-50 dark:bg-emerald-950/25 text-emerald-600 border border-emerald-100 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/25 text-amber-600 border border-amber-100 dark:border-amber-800/30'
              }`}>
              {msaStatus === 'signed' ? 'Verified Signed' : 'Awaiting Signatures'}
            </span>
          </div>

          <div className="space-y-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100/40 dark:border-slate-850 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <p>Your Master Service Agreement is ready for review. Please read the terms carefully before signing.</p>
          </div>

          {msaStatus !== 'signed' ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Legal Signature Section</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="signer-name" className="text-[10px] uppercase font-bold text-slate-400">Authorized Name</label>
                  <input
                    id="signer-name"
                    name="signerName"
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="signer-title" className="text-[10px] uppercase font-bold text-slate-400">Title / Capacity</label>
                  <input
                    id="signer-title"
                    name="signerTitle"
                    type="text"
                    value={signerTitle}
                    onChange={(e) => setSignerTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={onSignAgreement}
                  type="button"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/15"
                >
                  Authorize & Sign Agreement
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50/40 dark:bg-emerald-900/10 border border-emerald-100 rounded-xl flex items-center gap-3.5 text-xs">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Agreement Signed Off</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Digitally signed by {signerName} ({signerTitle})</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentTab === 'deliverables') {
    if (currentRole === 'client') {
      return <ClientDeliverables onTriggerAction={onTriggerAction} />;
    }
    return <AdminDeliverables onTriggerAction={onTriggerAction} />;
  }

  if (currentTab === 'profile') {
    return (
      <div className="animate-in fade-in duration-300">
        <Profile currentUser={currentUser} onUpdateAvatar={onUpdateAvatar} onRemoveAvatar={onRemoveAvatar} />
      </div>
    );
  }

  // Settings is admin-only - clients cannot access it
  if (currentTab === 'settings' && currentRole === 'client') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 dark:text-slate-400 text-sm">This section is for agency management. Please contact your agency team for any account changes.</p>
      </div>
    );
  }

  if (currentTab === 'invoices') {
    if (currentRole === 'client') {
      return <ClientInvoicesTab currentUser={currentUser} />;
    }
    return <AdminInvoicesTab currentUser={currentUser} onTriggerAction={onTriggerAction} />;
  }

  if (currentTab === 'notifications') {
    const allNotifications = notificationsProp ?? [];
    const unread = allNotifications.filter((n) => !n.read);
    const read = allNotifications.filter((n) => n.read);
    const sorted = [...unread, ...read];

    return (
      <div className="animate-in fade-in duration-300 px-2 max-w-5xl mx-auto w-full py-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-amber-600/10 rounded-xl">
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {unread.length > 0
                ? `${unread.length} unread · ${allNotifications.length} total`
                : 'Stay updated with project activity and alerts'}
            </p>
          </div>
          {allNotifications.length > 0 && (
            <button
              onClick={onMarkAllNotificationsRead}
              className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40 rounded-lg transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {notificationLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <SkeletonCard lines={2} />
              </div>
            ))}
          </div>
        ) : allNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No notifications yet</p>
            <p className="text-[11px] text-slate-400 mt-1 text-center max-w-xs">
              Notifications from project updates, approvals, and team activity will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
            {sorted.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={onMarkNotificationRead}
                onApprove={onApproveNotification}
                onReject={onRejectNotification}
                onPreview={onPreviewNotification}
                onDownload={onDownloadNotification}
                onAction={onNotificationAction}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (currentTab === 'support') {
    return (
      <div className="animate-in fade-in duration-300 px-2 max-w-5xl mx-auto w-full py-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-emerald-600/10 rounded-xl">
            <LifeBuoy className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Support Center</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Get help and contact our support team</p>
          </div>
        </div>
        <EmptyState icon={MessageCircle} title="How can we help?" description="Submit a ticket or browse our knowledge base." />
      </div>
    );
  }

  if (currentTab === 'branding') {
    if (currentRole === 'client') {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500 dark:text-slate-400 text-sm">Portal configuration is managed by your agency team. Please reach out if you have any questions.</p>
        </div>
      );
    }
    return (
      <div className="animate-in fade-in duration-300 px-2 max-w-5xl mx-auto w-full py-4">
        <BrandingSettingsPage />
      </div>
    );
  }

  if (currentTab === 'system') {
    if (currentRole === 'client') {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500 dark:text-slate-400 text-sm">System administration is restricted to agency personnel.</p>
        </div>
      );
    }
    return (
      <div className="animate-in fade-in duration-300 px-2 max-w-5xl mx-auto w-full py-4 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">System Administration</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Database management, maintenance tools, and system controls.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-2">Database Reset</h3>
            <p className="text-[11px] text-slate-400 mb-4">Reset all project, agreement, and activity data to the initial state.</p>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
                  onResetData();
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Reset Database
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-2">System Information</h3>
            <div className="space-y-3">
              {[
                ['Node Environment', 'production'],
                ['API Version', 'v2.1.0'],
                ['Database', 'MongoDB Atlas'],
                ['Auth Provider', 'JWT + Refresh Tokens'],
                ['Storage Backend', 'Local / S3 Compatible'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentTab === 'clients') {
    if (currentRole === 'client') {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500 dark:text-slate-400 text-sm">Client management is restricted to agency personnel.</p>
        </div>
      );
    }
    return (
      <div className="animate-in fade-in duration-300 px-2 max-w-5xl mx-auto w-full py-4 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Client Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Onboard new clients and manage existing client workspaces.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-2">Onboarding Links</h3>
          <p className="text-[11px] text-slate-400 mb-4">Generate secure onboarding links for new client registration.</p>
          <button
            onClick={() => onTriggerAction('Opening onboarding link generator...')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Generate Onboarding Link
          </button>
        </div>
      </div>
    );
  }

  if (currentTab === 'analytics') {
    if (currentRole === 'client') {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500 dark:text-slate-400 text-sm">This section is for agency management. Please contact your agency team for any account changes.</p>
        </div>
      );
    }
    return (
      <div className="animate-in fade-in duration-300 px-2 max-w-5xl mx-auto w-full py-4 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Analytics Dashboard</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Agency-wide performance metrics and insights.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Active Projects', value: metrics.activeProjects, color: 'text-blue-400', bg: 'bg-blue-600/10' },
            { label: 'Pending Approvals', value: metrics.pendingApprovals, color: 'text-amber-400', bg: 'bg-amber-600/10' },
            { label: 'Monthly Revenue', value: `$${metrics.monthlyRevenue?.toLocaleString() || '0'}`, color: 'text-emerald-400', bg: 'bg-emerald-600/10' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className={`inline-flex p-2.5 rounded-xl ${stat.bg} mb-3`}>
                <BarChart3 className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-4">Team Velocity</h3>
          <div className="text-xs text-slate-400">
            <p className="mb-2">Metric: {metrics.teamProductivity || 0}%</p>
            <ProgressMeter value={metrics.teamProductivity || 0} label="Team productivity" className="h-2" />
          </div>
        </div>
      </div>
    );
  }

  if (currentTab === 'billing') {
    if (currentRole === 'client') {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500 dark:text-slate-400 text-sm">This section is for agency management. Please contact your agency team for any account changes.</p>
        </div>
      );
    }
    return (
      <div className="animate-in fade-in duration-300 px-2 max-w-5xl mx-auto w-full py-4 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Billing & Finance</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage agency billing, subscription plans, and financial reports.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Monthly Revenue', value: `$${metrics.monthlyRevenue?.toLocaleString() || '0'}`, desc: 'Current month' },
            { label: 'Active Invoices', value: '4', desc: 'Pending payment' },
            { label: 'Current Plan', value: subscription ? subscription.planName : '-', desc: subscription ? subscription.status : 'No data' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <p className="text-xs font-bold text-slate-500">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">{stat.value}</p>
              <p className="text-[10px] text-slate-400 mt-1">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentTab === 'integrations') {
    if (currentRole === 'client') {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500 dark:text-slate-400 text-sm">This section is for agency management. Please contact your agency team for any account changes.</p>
        </div>
      );
    }
    return (
      <div className="animate-in fade-in duration-300 px-2 max-w-5xl mx-auto w-full py-4 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Integrations</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Connect external tools and services to your agency workspace.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3">
              <EmptyState
                icon={Plus}
                title="No integrations available"
                description="Your workspace currently has no active integrations configured."
              />
            </div>
          ) : (
            integrations.map((integration) => (
              <div key={integration.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{integration.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${integration.status !== 'Needs auth' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                    {integration.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{integration.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (currentRole === 'client') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 dark:text-slate-400 text-sm">This section is for agency management. Please contact your agency team for any account changes.</p>
      </div>
    );
  }

  return (
    <Settings
      metrics={metrics}
      projects={projects}
      onResetData={onResetData}
      onTriggerAction={onTriggerAction}
      currentUser={currentUser}
      currentRole={currentRole === 'onboarding' ? 'client' : currentRole}
      onUpdateAvatar={onUpdateAvatar}
      onRemoveAvatar={onRemoveAvatar}
    />
  );
}

function AdminInvoicesTab({
  currentUser,
  onTriggerAction,
}: {
  currentUser: User | null;
  onTriggerAction: (msg: string) => void;
}) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clientMap, setClientMap] = useState<Record<string, string>>({});

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, clientsRes] = await Promise.all([
        api.getInvoices(),
        api.getClients().catch(() => ({ clients: [] })),
      ]);
      setInvoices(res.invoices || []);
      const map: Record<string, string> = {};
      for (const c of clientsRes.clients || []) {
        map[c._id || c.id] = c.name;
      }
      setClientMap(map);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.updateInvoice(id, { status });
      onTriggerAction(`Invoice marked as ${status}`);
      fetchInvoices();
    } catch (err: any) {
      onTriggerAction(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteInvoice(id);
      onTriggerAction('Invoice cancelled');
      fetchInvoices();
    } catch (err: any) {
      onTriggerAction(`Error: ${err.message}`);
    }
  };

  const statusColor: Record<string, string> = {
    draft: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    sent: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    viewed: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    paid: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    partially_paid: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    overdue: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
    cancelled: 'bg-slate-100 dark:bg-slate-800 text-slate-400',
  };

  return (
    <div className="animate-in fade-in duration-300 px-2 max-w-5xl mx-auto w-full py-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/10 rounded-xl">
            <Receipt className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Invoices</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">View and manage billing history</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Invoice</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-800/40">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="text-xs font-semibold text-rose-600">{error}</span>
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No invoices yet" description="Create your first invoice to get started." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left py-3 px-3 font-bold text-slate-400 uppercase tracking-wider">Invoice</th>
                <th className="text-left py-3 px-3 font-bold text-slate-400 uppercase tracking-wider">Client</th>
                <th className="text-right py-3 px-3 font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="text-center py-3 px-3 font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-3 font-bold text-slate-400 uppercase tracking-wider">Due Date</th>
                <th className="text-right py-3 px-3 font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: any) => (
                <tr key={inv._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{inv.invoiceNumber}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{clientMap[inv.clientId] || (inv.clientId ? inv.clientId.slice(0, 8) : '-')}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-800 dark:text-slate-200">
                    {inv.currency} {inv.total?.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusColor[inv.status] || statusColor.draft}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {(inv.status === 'draft' || inv.status === 'sent') && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(inv._id, 'sent')}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors"
                          title="Mark as Sent"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {['sent', 'viewed'].includes(inv.status) && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(inv._id, 'paid')}
                          className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-colors"
                          title="Mark as Paid"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {['draft', 'sent', 'viewed'].includes(inv.status) && (
                        <button
                          type="button"
                          onClick={() => handleDelete(inv._id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                          title="Cancel Invoice"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchInvoices}
      />
    </div>
  );
}

function ClientInvoicesTab({
  currentUser,
}: {
  currentUser: User | null;
}) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getInvoices();
      setInvoices(res.invoices || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const clientStatusColor: Record<string, string> = {
    Preparing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    Received: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    'Under Review': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    Paid: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    'Partially Paid': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    Overdue: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
    Cancelled: 'bg-slate-100 dark:bg-slate-800 text-slate-400',
  };

  const toClientStatus = (status: string): string => {
    const map: Record<string, string> = {
      draft: 'Preparing',
      sent: 'Received',
      viewed: 'Under Review',
      paid: 'Paid',
      partially_paid: 'Partially Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
    };
    return map[status] || status;
  };

  return (
    <div className="animate-in fade-in duration-300 px-2 max-w-5xl mx-auto w-full py-4 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-600/10 rounded-xl">
          <Receipt className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Invoices</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">View your billing history</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-800/40">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="text-xs font-semibold text-rose-600">{error}</span>
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No invoices yet" description="Invoices will appear here once generated by your agency team." />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv: any) => {
            const clientStatus = toClientStatus(inv.status);
            return (
              <div
                key={inv._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{inv.invoiceNumber}</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${clientStatusColor[clientStatus] || clientStatusColor.Preparing}`}>
                      {clientStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span>Issued: {inv.issuedDate ? new Date(inv.issuedDate).toLocaleDateString() : '-'}</span>
                    <span className="text-slate-300">•</span>
                    <span>Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-black text-slate-800 dark:text-slate-100">
                    {inv.currency} {inv.total?.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
