import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import ToggleSwitch from './ToggleSwitch';
import AISummaryCard from './widgets/AISummaryCard';
import EmptyState from './ui/EmptyState';
import { initialsDataUri } from '../utils/avatar';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  CalendarDays,
  Camera,
  CheckCircle,
  Cloud,
  CreditCard,
  Database,
  Globe,
  KeyRound,
  ListChecks,
  LockKeyhole,
  Loader2,
  Mail,
  MessageCircle,
  Palette,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TrendingUp,
  UploadCloud,
  Users,
} from 'lucide-react';
import { Metrics } from '../types';
import type { Project, User as AppUser } from '../types';

import { api } from '../utils/api';

interface SettingsProps {
  metrics: Metrics;
  projects?: Project[];
  onResetData: () => void;
  onTriggerAction: (msg: string) => void;
  currentUser: AppUser | null;
  currentRole?: 'admin' | 'client';
  onUpdateAvatar?: (file: File) => void;
  onRemoveAvatar?: () => void;
}

type SettingsTab = 'Client Workspace' | 'Security' | 'Notifications' | 'Integrations' | 'Billing';
type IntegrationStatus = 'Connected' | 'Ready' | 'Needs auth';

interface WorkspaceSettings {
  agencyName: string;
  portalDomain: string;
  welcomeMessage: string;
  clientPortalEnabled: boolean;
  whiteLabelEnabled: boolean;
  otpRequired: boolean;
  approvalEmails: boolean;
  whatsappAlerts: boolean;
  aiSummaries: boolean;
  teamSeats: number;
}

interface IntegrationItem {
  title: string;
  body: string;
  icon: LucideIcon;
  status: IntegrationStatus;
}

const settingTabs: SettingsTab[] = ['Client Workspace', 'Security', 'Notifications', 'Integrations', 'Billing'];

const defaultSettings: WorkspaceSettings = {
  agencyName: 'DevDale Agency',
  portalDomain: 'portal.devdale.com',
  welcomeMessage: 'Track every milestone, file, approval, and decision in one secure place.',
  clientPortalEnabled: true,
  whiteLabelEnabled: true,
  otpRequired: true,
  approvalEmails: true,
  whatsappAlerts: false,
  aiSummaries: true,
  teamSeats: 12,
};



function readStoredSettings(): WorkspaceSettings {
  try {
    const raw = localStorage.getItem('devdale-settings');
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export default function Settings({ metrics, projects, onResetData, onTriggerAction, currentUser, currentRole = 'client', onUpdateAvatar, onRemoveAvatar }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Client Workspace');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [settings, setSettings] = useState<WorkspaceSettings>(readStoredSettings);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [lastSavedAt, setLastSavedAt] = useState('Not saved this session');
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await api.getActivity();
        setActivities(data);
      } catch (err) {
        console.error('Failed to fetch activity', err);
      }
    };
    const fetchIntegrations = async () => {
      try {
        const data = await api.getIntegrations();
        setIntegrations(data);
      } catch (err) {
        console.error('Failed to fetch integrations', err);
      }
    };
    const fetchSubscription = async () => {
      try {
        const data = await api.getSubscription();
        setSubscription(data);
      } catch (err) {
        console.error('Failed to fetch subscription', err);
      }
    };
    if (activeTab === 'Security') {
      fetchActivities();
    } else if (activeTab === 'Integrations') {
      fetchIntegrations();
    } else if (activeTab === 'Billing') {
      fetchSubscription();
    }
  }, [activeTab]);

  const domainError = settings.portalDomain.trim().length === 0 || settings.portalDomain.includes(' ');

  useEffect(() => {
    try {
      localStorage.setItem('devdale-settings', JSON.stringify(settings));
    } catch {
      // Local persistence is optional in restricted browser contexts.
    }
  }, [settings]);

  const updateSetting = <K extends keyof WorkspaceSettings>(key: K, value: WorkspaceSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const toggleSetting = (key: keyof WorkspaceSettings) => {
    setSettings((current) => ({ ...current, [key]: !current[key] as never }));
  };

  const saveSettings = () => {
    if (domainError) {
      onTriggerAction('Portal domain is required and cannot contain spaces.');
      return;
    }
    const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastSavedAt(`Saved at ${stamp}`);
    onTriggerAction('Settings saved and synced across all client workspaces.');
  };

  const configureIntegration = (title: string) => {
    setIntegrations((current) =>
      current.map((integration) =>
        integration.title === title
          ? { ...integration, status: integration.status === 'Needs auth' ? 'Connected' : integration.status }
          : integration
      )
    );
    onTriggerAction(`${title} integration configured successfully.`);
  };

  const handleAvatarFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateAvatar) return;
    setUploadingAvatar(true);
    try {
      await onUpdateAvatar(file);
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    if (!onRemoveAvatar) return;
    if (window.confirm('Are you sure you want to remove your profile photo?')) {
      setRemovingAvatar(true);
      try {
        onRemoveAvatar();
      } finally {
        setRemovingAvatar(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 px-2 max-w-7xl mx-auto w-full text-xs">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Client Workspace</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your workspace, projects, and collaboration settings.
          </p>
          <p className="text-[10px] text-slate-400 font-bold mt-2">{lastSavedAt}</p>
        </div>
        <button
          type="button"
          onClick={saveSettings}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {settingTabs
          .filter((tab) => currentRole === 'admin' || (tab !== 'Integrations' && tab !== 'Billing'))
          .map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap border transition-all ${
              activeTab === tab
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 hover:border-blue-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Client Workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="relative">
                  <div className="relative">
                    <img
                      alt="Profile photo"
                      className="w-16 h-16 rounded-full border-2 border-blue-100 dark:border-slate-700 object-cover"
                      src={currentUser?.avatarUrl || initialsDataUri(currentUser?.name || 'User')}
                      onError={(e) => { (e.target as HTMLImageElement).src = initialsDataUri(currentUser?.name || 'User'); }}
                    />
                    {uploadingAvatar && (
                      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  {onUpdateAvatar && (
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      title="Upload profile photo"
                      aria-label="Upload profile photo"
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Camera className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">{currentUser?.name || 'User'}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser?.email || ''}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{currentUser?.title || ''}</p>
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
              {currentUser?.avatarUrl && onRemoveAvatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={removingAvatar}
                  className="mt-3 text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {removingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  Remove Photo
                </button>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Portal Identity</h3>
                <p className="text-[11px] text-slate-400 mt-1">Customize the client-facing workspace name, domain, and welcome message.</p>
              </div>
              <Palette className="w-5 h-5 text-blue-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Agency name</span>
                <input
                  id="settings-agency-name"
                  name="agencyName"
                  value={settings.agencyName}
                  onChange={(event) => updateSetting('agencyName', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </label>
              <label>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Portal domain</span>
                <input
                  id="settings-portal-domain"
                  name="portalDomain"
                  value={settings.portalDomain}
                  onChange={(event) => updateSetting('portalDomain', event.target.value)}
                  className={`mt-1 w-full rounded-xl border bg-slate-50 dark:bg-slate-950/40 px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 ${
                    domainError ? 'border-red-300 dark:border-red-800' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                {domainError && <span className="text-[10px] font-bold text-red-500 mt-1 block">Enter a valid domain without spaces.</span>}
              </label>
              <label className="md:col-span-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Client welcome message</span>
                <textarea
                  id="settings-welcome-message"
                  name="welcomeMessage"
                  value={settings.welcomeMessage}
                  onChange={(event) => updateSetting('welcomeMessage', event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 resize-none"
                />
              </label>
            </div>

            {currentRole === 'admin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {[
                  ['Client portal enabled', settings.clientPortalEnabled, () => toggleSetting('clientPortalEnabled')],
                  ['White-label mode', settings.whiteLabelEnabled, () => toggleSetting('whiteLabelEnabled')],
                ].map(([label, enabled, onClick]) => (
                  <div key={label as string} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{label as string}</span>
                    <ToggleSwitch enabled={enabled as boolean} onClick={onClick as () => void} label={`Toggle ${label as string}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Project Overview</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800/40">
                  <div className="text-slate-400 text-[10px] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Completion
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 mt-1">
                    {projects && projects.length > 0
                      ? `${Math.round(projects.reduce((a, p) => a + p.progress, 0) / projects.length)}%`
                      : `${metrics.teamProductivity}%`}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800/40">
                  <div className="text-slate-400 text-[10px] flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    Next Milestone
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 mt-1">
                    {projects && projects.length > 0
                      ? projects[0].nextMilestone
                      : 'UI Review'}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800/40">
                  <div className="text-slate-400 text-[10px] flex items-center gap-1">
                    <ListChecks className="w-3 h-3" />
                    Pending Approvals
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 mt-1">
                    {metrics.pendingApprovals}
                  </div>
                </div>
              </div>
            </div>

            <AISummaryCard
              onTriggerAction={onTriggerAction}
            />
          </div>
        </div>
      )}

      {activeTab === 'Security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Authentication & Access Control
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              {[
                ['JWT session duration', '8 hours', KeyRound],
                ['Magic link expiry', '24 hours', LockKeyhole],
                ['Rate limit', '10 attempts / 15 min', SlidersHorizontal],
                ['Secure uploads', 'Virus scan + signed URLs', UploadCloud],
              ].map(([label, value, Icon]) => {
                const CardIcon = Icon as LucideIcon;
                return (
                  <div key={label as string} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
                    <CardIcon className="w-4 h-4 text-blue-600" />
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-3">{label as string}</p>
                    <p className="font-black text-slate-800 dark:text-slate-100 mt-1">{value as string}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
              <div>
                <p className="font-black text-slate-800 dark:text-slate-100">Require email OTP for sensitive actions</p>
                <p className="text-[11px] text-slate-400 mt-1">Approvals, downloads, team changes, invoices, and secure link generation.</p>
              </div>
              <ToggleSwitch enabled={settings.otpRequired} onClick={() => toggleSetting('otpRequired')} label="Toggle OTP requirement" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Activity Log</h3>
            <div className="mt-4 space-y-3">
              {activities.length === 0 ? (
                <div className="text-[11px] text-slate-400 italic">No recent activity</div>
              ) : (
                activities.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-200">{item.message}</p>
                      <p className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
            {[
              ['Approval email alerts', 'Notify team members when deliverables need approval.', settings.approvalEmails, () => toggleSetting('approvalEmails'), Mail],
              ['WhatsApp notifications', 'Send deadline, approval, and invoice reminders over WhatsApp.', settings.whatsappAlerts, () => toggleSetting('whatsappAlerts'), MessageCircle],
              ['AI-generated summaries', 'Send weekly digest emails with project health and open decisions.', settings.aiSummaries, () => toggleSetting('aiSummaries'), Sparkles],
            ].map(([title, body, enabled, onClick, Icon]) => {
              const RowIcon = Icon as LucideIcon;
              return (
                <div key={title as string} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 text-blue-600">
                      <RowIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 dark:text-slate-100">{title as string}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{body as string}</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={enabled as boolean} onClick={onClick as () => void} label={`Toggle ${title as string}`} />
                </div>
              );
            })}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mt-3">Notification Digest</h3>
            <p className="text-[11px] text-slate-400 mt-1">Daily at 9:00 AM, weekly on Monday, and urgent changes instantly.</p>
            <button onClick={() => onTriggerAction('Test notification sent to all channels.')} className="mt-4 w-full rounded-xl bg-blue-600 text-white py-2.5 font-black">Send Test Notification</button>
          </div>
        </div>
      )}

      {activeTab === 'Integrations' && currentRole === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3">
              <EmptyState
                icon={Cloud}
                title="No integrations available"
                description="Your workspace currently has no active integrations configured."
              />
            </div>
          ) : (
            integrations.map((integration) => {
              const icons: Record<string, LucideIcon> = {
                Cloud, UploadCloud, MessageCircle, CalendarDays, Globe, Database
              };
              const Icon = icons[integration.iconName] || Cloud;
              return (
                <div key={integration.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-black rounded-full px-2 py-1 ${integration.status === 'Needs auth' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {integration.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mt-4">{integration.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{integration.description}</p>
                  <button onClick={() => onTriggerAction(`Configure ${integration.name}`)} className="mt-4 w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2 text-xs font-black text-slate-700 dark:text-slate-200">
                    {integration.status === 'Needs auth' ? 'Authorize' : 'Configure'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'Billing' && currentRole === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Payment Setup
            </h3>
            <p className="text-[11px] text-slate-400 mt-2">Manage invoices from the <strong>Invoices</strong> tab in the sidebar.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mt-3">Team Seats</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {subscription ? `${subscription.teamSeatsCount} active members, ${subscription.agencyMembersCount} agency members, ${subscription.contractorsCount} contractors.` : 'No subscription data available.'}
              </p>
              <button
                onClick={() => {
                  onTriggerAction('Team member invited and seat count updated.');
                }}
                className="mt-4 w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2 text-xs font-black"
              >
                Invite Member
              </button>

            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mt-3">{subscription ? subscription.planName : '-'}</h3>
              <p className="text-[11px] text-slate-400 mt-1">Status: {subscription ? subscription.status : 'No data'}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
