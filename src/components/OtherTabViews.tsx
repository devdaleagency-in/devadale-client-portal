import { useState } from 'react';
import {
  Project,
  Agreement,
  Metrics,
  User,
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
  Users,
  ClipboardList,
  BarChart3,
} from 'lucide-react';
import EmptyState from './ui/EmptyState';
import BrandingSettingsPage from './branding/BrandingSettingsPage';
import Settings from './Settings';
import Profile from './Profile';
import ProgressMeter from './ProgressMeter';
import RealtimeChat from './chat/RealtimeChat';
import AdminDeliverables from './AdminDeliverables';
import ClientDeliverables from './ClientDeliverables';

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
}: OtherTabViewsProps) {
  const [signerName, setSignerName] = useState('Admin User');
  const [signerTitle, setSignerTitle] = useState('Director');
  const pipelineStages = [
    ['Discovery', 100, 'completed', 'Sep 15'],
    ['Requirement Collection', 100, 'completed', 'Sep 22'],
    ['Research & Planning', 100, 'completed', 'Oct 02'],
    ['UI/UX Design', 72, 'active', 'Oct 27'],
    ['Development', 28, 'active', 'Nov 05'],
    ['Testing', 0, 'planned', 'Nov 12'],
    ['Revisions', 0, 'planned', 'Nov 14'],
    ['Deployment', 0, 'planned', 'Nov 18'],
    ['Maintenance', 0, 'planned', 'Ongoing'],
    ['Completed', 0, 'planned', 'Nov 20'],
  ];
  const taskColumns = [
    { title: 'Completed', tone: 'emerald', tasks: ['Discovery workshop', 'Brand asset audit', 'Competitor teardown'] },
    { title: 'Active', tone: 'blue', tasks: ['Homepage wireframes', 'Portal token system', 'Client feedback pass'] },
    { title: 'Pending', tone: 'amber', tasks: ['Staging QA checklist', 'Final invoice generation', 'Launch email automation'] },
  ];

  if (currentTab === 'projects') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 px-2 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Project Workspace Directories</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active, conceptualizing, and closed sprint systems.</p>
          </div>
          <button
            type="button"
            onClick={onNewProjectClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Project Pipeline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3">
              <EmptyState
                icon={FolderOpen}
                title="No projects yet"
                description="Active projects will appear here once they are created."
              />
            </div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-350 dark:hover:border-slate-700 hover:scale-[1.01] cursor-pointer transition-all h-[240px]"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-full uppercase">
                      {proj.stage}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${proj.health === 'healthy'
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : proj.health === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-rose-500 animate-pulse'
                      }`} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-3">{proj.name}</h3>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1">Lead Architect: {proj.team?.[0]?.name || 'Sarah Chen'}</p>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                      <span>Active Sprint Completion</span>
                      <span className="font-mono">{proj.progress}%</span>
                    </div>
                    <ProgressMeter
                      value={proj.progress}
                      label={`${proj.name} sprint completion`}
                      className="h-1"
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100/30 dark:border-slate-850">
                    <div>
                      <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Next Milestone</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block truncate max-w-[150px]">{proj.nextMilestone}</span>
                    </div>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{proj.nextMilestoneDate}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {taskColumns.map((column) => (
            <div key={column.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">{column.title} Tasks</h3>
                <span className="text-[10px] font-bold text-slate-400">{column.tasks.length} cards</span>
              </div>
              <div className="space-y-2">
                {column.tasks.map((task, index) => (
                  <button
                    key={task}
                    type="button"
                    onClick={() => onTriggerAction(`${task} opened in ${column.title.toLowerCase()} board.`)}
                    className="w-full text-left rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3 hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{task}</p>
                      <span className="text-[9px] uppercase font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                        P{index + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400 font-semibold">
                      <Clock3 className="w-3.5 h-3.5" />
                      Due {index === 0 ? 'today' : index === 1 ? 'Friday' : 'next week'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentTab === 'timeline') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 px-2 max-w-6xl mx-auto w-full">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Project Roadmap</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Interactive pipeline with stage completion, estimated dates, delay indicators, and status badges.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 overflow-x-auto">
          <div className="min-w-[860px] grid grid-cols-10 gap-2">
            {pipelineStages.map(([label, progress, status, date], index) => (
              <button
                key={label}
                type="button"
                onClick={() => onTriggerAction(`${label} stage selected. ${progress}% complete, target ${date}.`)}
                className={`relative rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 ${status === 'completed'
                    ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10'
                    : status === 'active'
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/10'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${status === 'completed' ? 'bg-emerald-500 text-white' : status === 'active' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                    {index + 1}
                  </span>
                  {label === 'Development' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 mt-3 leading-tight">{label}</p>
                <p className="text-[9px] font-bold text-slate-400 mt-1">{date}</p>
                <ProgressMeter
                  value={Number(progress)}
                  label={`${label} stage progress`}
                  className="mt-3 progress-meter--tall"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            ['Upcoming milestone', 'V1 prototype review', 'Oct 27', 'blue'],
            ['Estimated delivery', 'Production handoff', 'Nov 20', 'emerald'],
            ['Delay watch', 'API copy review pending', '2 day risk', 'amber'],
          ].map(([title, value, meta, tone]) => (
            <div key={title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{title}</p>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mt-2">{value}</h3>
              <span className={`inline-flex mt-3 text-[10px] font-black rounded-full px-2 py-1 ${tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                }`}>{meta}</span>
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

          <div className="space-y-3.5 max-h-48 overflow-y-auto bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100/40 dark:border-slate-850 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
            <p className="font-bold text-slate-700 dark:text-slate-300">Section 1. Core Engagement Parameters_</p>
            <p>DevDale agency shall design, formulate, and optimize digital deliverables for DevDale Agency conforming to sprint requirements. The project timeline triggers Oct 02 sprints.</p>
            <p className="font-bold text-slate-700 dark:text-slate-300 mt-2">Section 2. Licensing & Deliverables_</p>
            <p>Upon golden master handover, the intellectual property is transferred. Admin User (Director) coordinates feedback metrics loop weekly.</p>
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
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Digitally signed by {signerName} ({signerTitle}) • Oct 22 • Securely logged.</span>
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
    return (
      <div className="animate-in fade-in duration-300 px-2 max-w-5xl mx-auto w-full py-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-600/10 rounded-xl">
            <Receipt className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Invoices</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">View and manage your billing history</p>
          </div>
        </div>
        <EmptyState icon={FolderOpen} title="No invoices yet" description="Invoices will appear here once billing is processed." />
      </div>
    );
  }

  if (currentTab === 'notifications') {
    return (
      <div className="animate-in fade-in duration-300 px-2 max-w-5xl mx-auto w-full py-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-amber-600/10 rounded-xl">
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Stay updated with project activity and alerts</p>
          </div>
        </div>
        <EmptyState icon={Bell} title="All caught up!" description="You have no unread notifications." />
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

  if (currentTab === 'team') {
    return (
      <div className="animate-in fade-in duration-300 px-2 max-w-5xl mx-auto w-full py-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-purple-600/10 rounded-xl">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Team Access</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage team members and permissions</p>
          </div>
        </div>
        <EmptyState icon={Users} title="No team members yet" description="Invite team members to collaborate on projects." />
      </div>
    );
  }

  if (currentTab === 'meetings') {
    return (
      <div className="animate-in fade-in duration-300 px-2 max-w-5xl mx-auto w-full py-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-rose-600/10 rounded-xl">
            <ClipboardList className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Meeting Notes</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Notes and summaries from your meetings</p>
          </div>
        </div>
        <EmptyState icon={ClipboardList} title="No meeting notes yet" description="Meeting notes will appear here once recorded." />
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
            <p className="text-[11px] text-slate-400 mb-4">Reset all project, agreement, and activity data to the initial mock state.</p>
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
            { label: 'Plan', value: 'Pro', desc: 'Agency tier' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{stat.value}</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{stat.label}</p>
              <p className="text-[10px] text-slate-500">{stat.desc}</p>
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
          {[
            { name: 'Slack', desc: 'Send notifications to Slack channels', connected: true },
            { name: 'GitHub', desc: 'Sync project milestones with repos', connected: true },
            { name: 'Jira', desc: 'Bi-directional task sync', connected: false },
            { name: 'HubSpot', desc: 'CRM integration for client management', connected: false },
            { name: 'Stripe', desc: 'Payment processing & invoicing', connected: true },
            { name: 'Google Drive', desc: 'Cloud file storage & sharing', connected: false },
          ].map((integration) => (
            <div key={integration.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{integration.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${integration.connected ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                  {integration.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <p className="text-xs text-slate-500">{integration.desc}</p>
            </div>
          ))}
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
