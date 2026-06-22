import { api } from '../utils/api';
import { useState, useEffect } from 'react';
import {
  Rocket,
  Activity,
  FolderKanban,
  CheckSquare,
  Upload,
  MessageSquare,
  FileText,
  ListChecks,
  RefreshCw,
  ArrowRight,
  ChevronRight,
  Plus,
  FolderOpen,
  Share2,
  ThumbsUp,
  DollarSign,
  UserCheck,
  FileDown,
  ExternalLink,
  History,
  Layers,
  Sparkles,
  ChevronDown,
  Edit3,
  Clock,
  Calendar,
} from 'lucide-react';
import { Project, Agreement, ActivityFeed } from '../types';
import { useBrandingStore } from '../store/brandingStore';
import UpcomingDeadlines from './widgets/UpcomingDeadlines';
import PendingApprovalsWidget from './widgets/PendingApprovalsWidget';
import RecentUploads from './widgets/RecentUploads';
import ProjectProgress from './widgets/ProjectProgress';
import InvoiceStatus from './widgets/InvoiceStatus';
import TeamActivityFeed from './widgets/TeamActivityFeed';
import TimelineRoadmap from './widgets/TimelineRoadmap';
import SkeletonCard from './ui/SkeletonCard';
import EmptyState from './ui/EmptyState';
import ErrorState from './ui/ErrorState';
import ProgressMeter from './ProgressMeter';
import { useDeadlines } from '../hooks/useDeadlines';

interface ClientConsoleProps {
  projects: Project[];
  activity: ActivityFeed[];
  agreements?: Agreement[];
  loading?: boolean;
  error?: string | null;
  onNewProjectClick?: () => void;
  currentUser?: any;
  onUpdateAvatar?: (file: File) => void;
  onRemoveAvatar?: () => void;
  onTriggerAction: (msg: string) => void;
  onOpenSupportchat?: () => void;
  onOpenMessages?: () => void;
  onOpenUploadModal?: () => void;
  onOpenRevisionModal?: () => void;
  onOpenMeetingModal?: () => void;
  onSignAgreement: () => void;
  onViewRoadmap?: () => void;
  msaStatus: 'signed' | 'pending' | 'draft';
}

export default function ClientConsole({
  projects,
  activity,
  loading,
  error,
  onTriggerAction,
  onOpenSupportchat,
  onOpenMessages,
  onOpenUploadModal,
  onOpenRevisionModal,
  onOpenMeetingModal,
  onViewRoadmap,
  onSignAgreement,
  msaStatus,
}: ClientConsoleProps) {
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const { deadlines, loading: deadlinesLoading } = useDeadlines();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  useEffect(() => {
    api.getInvoices()
      .then((res) => setInvoices(res.invoices || []))
      .catch(() => {})
      .finally(() => setInvoicesLoading(false));
  }, []);

  const brandingConfig = useBrandingStore((s) => s.config);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto w-full px-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <SkeletonCard lines={1} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <SkeletonCard lines={5} />
          </div>
          <div className="lg:col-span-5">
            <SkeletonCard lines={4} />
          </div>
        </div>
        <SkeletonCard lines={3} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <SkeletonCard lines={4} />
          </div>
          <div className="lg:col-span-5">
            <SkeletonCard lines={4} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto w-full px-2">
        <ErrorState
          title="Failed to load workspace"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const focusProj = projects.find((p) => p.id === 'proj-focus') || projects[0];

  const handleDownload = (filename: string) => {
    onTriggerAction(
      `Initiating download for ${filename}... Package compiled and verified!`
    );
  };

  if (!focusProj) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto w-full px-2">
        <div className="flex items-center justify-center min-h-[300px] text-slate-400 text-sm">
          No projects found. Please check back later.
        </div>
      </div>
    );
  }

  const Section = ({
    icon: Icon,
    title,
  }: {
    icon: typeof History;
    title: string;
  }) => (
    <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-8 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-wide uppercase">
          {title}
        </h3>
      </div>
    </div>
  );

  const overdueDeadlines = 0;
  const pendingApprovals = 0;
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue').length;

  const agencyName = brandingConfig.whiteLabelEnabled && brandingConfig.workspaceName
    ? brandingConfig.workspaceName
    : 'DevDale Agency';
  const welcomeMsg = brandingConfig.welcomeMessage || 'Track every milestone, file, approval, and decision in one secure place.';

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full px-2">
      {/* ─── Welcome & Actions ─── */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">
            Welcome back.
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {welcomeMsg}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Here is what's happening with{' '}
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {agencyName}
            </span>{' '}
            today.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setShowQuickAction(!showQuickAction)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-100" />
              <span>Quick Action</span>
              <ChevronDown className="w-3 h-3 text-blue-200" />
            </button>
            {showQuickAction && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowQuickAction(false)} />
                <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-20 animate-in fade-in duration-100">
                  <button
                    onClick={() => { setShowQuickAction(false); onOpenUploadModal?.(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Upload Files</span>
                  </button>
                  <button
                    onClick={() => { setShowQuickAction(false); onOpenRevisionModal?.(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Request Revision</span>
                  </button>
                  <button
                    onClick={() => { setShowQuickAction(false); onOpenMeetingModal?.(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Schedule Meeting</span>
                  </button>
                  <button
                    onClick={() => { setShowQuickAction(false); onOpenMessages?.(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>Send Message</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── Quick Stats Strip ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Clock, label: 'Upcoming Deadlines', value: '0', accent: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800', detail: 'No upcoming deadlines' },
          { icon: ThumbsUp, label: 'Pending Approvals', value: '0', accent: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800', detail: 'No items to review' },
          { icon: Upload, label: 'Recent Uploads', value: '0', accent: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800', detail: 'No files uploaded this week' },
          { icon: DollarSign, label: 'Overdue Invoices', value: String(overdueInvoices), accent: overdueInvoices > 0 ? 'text-rose-600' : 'text-slate-400', bg: overdueInvoices > 0 ? 'bg-rose-50 dark:bg-rose-950/20' : 'bg-slate-50 dark:bg-slate-800', detail: overdueInvoices > 0 ? `${overdueInvoices} invoice${overdueInvoices > 1 ? 's' : ''} overdue` : 'No overdue invoices' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-4 h-4 ${stat.accent}`} />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">{stat.label}</p>
              <p className={`text-lg font-black ${stat.accent}`}>{stat.value}</p>
              <p className="text-[8px] text-slate-400">{stat.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Main Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Deadlines */}
        <div className="lg:col-span-12">
          <UpcomingDeadlines deadlines={deadlines} loading={deadlinesLoading} />
        </div>
      </div>

      {/* ─── Section: Approvals ─── */}
      <Section icon={ListChecks} title="Pending Approvals" />
      <PendingApprovalsWidget
        approvals={[]}
        onApprove={(id) => onTriggerAction(`Approved item ${id}.`)}
        onReject={(id) => onTriggerAction(`Rejected item ${id}.`)}
        onPreview={(item) => onTriggerAction(`Previewing "${item.title}".`)}
      />

      {/* ─── Section: Files & Invoices ─── */}
      <Section icon={Upload} title="Files & Invoices" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <RecentUploads
            uploads={[]}
            onDownload={(f) => handleDownload(f.name)}
            onPreview={(f) => onTriggerAction(`Previewing "${f.name}".`)}
          />
        </div>
        <div className="lg:col-span-5">
          <InvoiceStatus
            invoices={invoices}
            loading={invoicesLoading}
            onPay={(inv) => onTriggerAction(`Processing payment for ${inv.number}.`)}
            onDownload={(inv) => onTriggerAction(`Downloading invoice ${inv.number}.`)}
          />
        </div>
      </div>

      {/* ─── Section: Progress & Timeline ─── */}
      <Section icon={RefreshCw} title="Progress & Timeline" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <ProjectProgress project={focusProj} />
        </div>
        <div className="lg:col-span-7">
          <TimelineRoadmap
            milestones={[]}
            onMilestoneClick={(id) => {
              onTriggerAction(`Milestone ${id} selected.`);
            }}
          />
        </div>
      </div>

      {/* ─── Section: Team Activity ─── */}
      <Section icon={RefreshCw} title="Team Activity" />
      <TeamActivityFeed activities={[]} maxItems={6} />

      {/* ─── Section: Agreement ─── */}
      <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-8 mt-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-wide uppercase">
            Agreement
          </h3>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 border-l-4 border-l-blue-500 dark:border-l-blue-400 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm relative overflow-hidden transition-all">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Project Agreement
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Master Service Agreement
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {msaStatus === 'signed' ? (
            <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40 rounded-full text-xs font-bold flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              Signed & Verified
            </span>
          ) : (
            <>
              <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/30 rounded-full text-[10px] font-bold">
                Awaiting Signature
              </span>
              <button
                onClick={onSignAgreement}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
              >
                Review & Sign
              </button>
            </>
          )}
        </div>
      </div>

      {/* Floating Support FAB */}
      <button
        onClick={onOpenSupportchat}
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
        title="Open Support Agent Help Desk"
      >
        <MessageSquare className="w-5 h-5" />
      </button>
    </div>
  );
}
