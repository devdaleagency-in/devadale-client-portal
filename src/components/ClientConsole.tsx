import { useState } from 'react';
import {
  Rocket,
  Clock,
  TrendingUp,
  Activity,
  FolderKanban,
  CheckSquare,
  Upload,
  MessageSquare,
  FileText,
  ListChecks,
  RefreshCw,
  ArrowRight,
  Palette,
  Lightbulb,
  ChevronRight,
  Plus,
  FolderOpen,
  Share2,
  ThumbsUp,
  DollarSign,
  Calendar,
  UserCheck,
  FileDown,
  ExternalLink,
  History,
  Layers,
} from 'lucide-react';
import { Project, Agreement, ActivityFeed } from '../types';
import ProgressMeter from './ProgressMeter';
import { useBrandingStore } from '../store/brandingStore';
import { initialsDataUri } from '../utils/avatar';
import UpcomingDeadlines from './widgets/UpcomingDeadlines';
import PendingApprovalsWidget from './widgets/PendingApprovalsWidget';
import RecentUploads from './widgets/RecentUploads';
import ProjectProgress from './widgets/ProjectProgress';
import InvoiceStatus from './widgets/InvoiceStatus';
import TeamActivityFeed from './widgets/TeamActivityFeed';
import TimelineRoadmap from './widgets/TimelineRoadmap';
import {
  INITIAL_DEADLINES,
  INITIAL_APPROVALS,
  INITIAL_UPLOADS,
  INITIAL_INVOICES,
  INITIAL_TEAM_ACTIVITY,
} from '../data';
import SkeletonCard from './ui/SkeletonCard';
import EmptyState from './ui/EmptyState';
import ErrorState from './ui/ErrorState';

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
  onSignAgreement: () => void;
  onViewRoadmap?: () => void;
  msaStatus: 'signed' | 'pending' | 'draft';
}

const roadmapMilestones = [
  { id: 'm1', label: 'Discovery & Research', date: 'Sept 15', status: 'completed' as const, description: 'Client requirements and market analysis' },
  { id: 'm2', label: 'Concept Development', date: 'Oct 02', status: 'completed' as const, description: 'Brand concepts and design direction' },
  { id: 'm3', label: 'UI/UX Design', date: 'In Progress', status: 'active' as const, description: 'Wireframes and high-fidelity mockups' },
  { id: 'm4', label: 'Prototype', date: 'Oct 27', status: 'planned' as const, description: 'Interactive prototype for user testing' },
  { id: 'm5', label: 'Development', date: 'Nov 05', status: 'planned' as const, description: 'Frontend and backend implementation' },
  { id: 'm6', label: 'Testing & QA', date: 'Nov 12', status: 'planned' as const, description: 'Quality assurance and bug fixes' },
];

export default function ClientConsole({
  projects,
  activity,
  loading,
  error,
  onTriggerAction,
  onOpenSupportchat,
  onOpenMessages,
  onSignAgreement,
  onViewRoadmap,
  msaStatus,
}: ClientConsoleProps) {
  const [showFigmaPreview, setShowFigmaPreview] = useState(false);

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

  const overdueDeadlines = INITIAL_DEADLINES.filter(d => d.status === 'overdue').length;
  const pendingApprovals = INITIAL_APPROVALS.filter(a => a.status === 'pending').length;
  const overdueInvoices = INITIAL_INVOICES.filter(i => i.status === 'overdue').length;

  const brandingConfig = useBrandingStore((s) => s.config);
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
            Welcome back, Alex.
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
          <button
            onClick={() =>
              onTriggerAction(
                'Security share token generated. Link copied to clipboard!'
              )
            }
            className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Share Access</span>
          </button>
          <button
            type="button"
            onClick={onOpenMessages}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-100" />
            <span>Messages</span>
          </button>
        </div>
      </section>

      {/* ─── Quick Stats Strip ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Clock, label: 'Upcoming Deadlines', value: INITIAL_DEADLINES.length.toString(), accent: overdueDeadlines > 0 ? `text-rose-600` : 'text-blue-600', bg: overdueDeadlines > 0 ? 'bg-rose-50 dark:bg-rose-950/20' : 'bg-blue-50 dark:bg-blue-950/20', detail: `${overdueDeadlines} overdue` },
          { icon: ThumbsUp, label: 'Pending Approvals', value: pendingApprovals.toString(), accent: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20', detail: 'items to review' },
          { icon: Upload, label: 'Recent Uploads', value: INITIAL_UPLOADS.length.toString(), accent: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/20', detail: 'files this week' },
          { icon: DollarSign, label: 'Overdue Invoices', value: overdueInvoices.toString(), accent: overdueInvoices > 0 ? 'text-rose-600' : 'text-emerald-600', bg: overdueInvoices > 0 ? 'bg-rose-50 dark:bg-rose-950/20' : 'bg-emerald-50 dark:bg-emerald-950/20', detail: 'needs attention' },
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

      {/* ─── Main Grid: Focus + Deadlines ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project Focus Card */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 border-t-4 border-t-blue-500 dark:border-t-blue-400 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Project Focus
              </span>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-3">
                {focusProj.name}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40 px-3 py-1 rounded-full text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Healthy</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-6 border-y border-slate-200 dark:border-slate-800/65 py-6">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Current Stage
              </p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1.5">
                {focusProj.stage}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Progress
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono">
                  {focusProj.progress}%
                </span>
                <ProgressMeter
                  value={focusProj.progress}
                  label={`${focusProj.name} progress`}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Next Milestone
              </p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1.5">
                {focusProj.nextMilestone}
              </p>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 tracking-wide font-semibold mt-0.5 block">
                {focusProj.nextMilestoneDate}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-2">
                {(focusProj.team || []).map((t, i) => (
                  <img
                    key={i}
                    alt={t.name}
                    src={t.avatarUrl || initialsDataUri(t.name)}
                    className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-sm"
                    title={t.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = initialsDataUri(t.name);
                    }}
                  />
                ))}
                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-bold text-slate-500 font-mono">
                  +3
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold pl-2">
                Sprints Active
              </span>
            </div>
            <button
              type="button"
              onClick={onViewRoadmap}
              className="text-xs text-blue-500 hover:text-blue-600 font-bold hover:underline transition-all"
            >
              View Roadmap
            </button>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="lg:col-span-5">
          <UpcomingDeadlines deadlines={INITIAL_DEADLINES} />
        </div>
      </div>

      {/* ─── Section: Approvals ─── */}
      <Section icon={ListChecks} title="Pending Approvals" />
      <PendingApprovalsWidget
        approvals={INITIAL_APPROVALS}
        onApprove={(id) => onTriggerAction(`Approved item ${id}.`)}
        onReject={(id) => onTriggerAction(`Rejected item ${id}.`)}
        onPreview={(item) => onTriggerAction(`Previewing "${item.title}".`)}
      />

      {/* ─── Section: Files & Invoices ─── */}
      <Section icon={Upload} title="Files & Invoices" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <RecentUploads
            uploads={INITIAL_UPLOADS}
            onDownload={(f) => handleDownload(f.name)}
            onPreview={(f) => onTriggerAction(`Previewing "${f.name}".`)}
          />
        </div>
        <div className="lg:col-span-5">
          <InvoiceStatus
            invoices={INITIAL_INVOICES}
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
            milestones={roadmapMilestones}
            onMilestoneClick={(id) => {
              const m = roadmapMilestones.find((ms) => ms.id === id);
              onTriggerAction(`Navigating to milestone: ${m?.label}.`);
            }}
          />
        </div>
      </div>

      {/* ─── Section: Team Activity ─── */}
      <Section icon={RefreshCw} title="Team Activity" />
      <TeamActivityFeed activities={INITIAL_TEAM_ACTIVITY} maxItems={6} />

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
              Master Service Agreement - Brand_MSA_v2_signed.pdf
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

      {/* ─── Section: Deliverables ─── */}
      <Section icon={FileDown} title="Deliverables" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => handleDownload('Brand Guidelines.pdf')}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700/50 hover:-translate-y-0.5 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Brand Guidelines.pdf
              </h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                2.4 MB • Updated yesterday
              </p>
            </div>
          </div>
          <FileDown className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </div>

        <div
          onClick={() => setShowFigmaPreview(true)}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700/50 hover:-translate-y-0.5 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-slate-800 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Desktop Wireframes
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Link • Figma Prototype
              </p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
        </div>

        <div
          onClick={() => handleDownload('Assets_Package.zip')}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700/50 hover:-translate-y-0.5 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Assets_Package.zip
              </h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                45 MB • 3 days ago
              </p>
            </div>
          </div>
          <FileDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </div>
      </div>

      {/* Floating Support FAB */}
      <button
        onClick={onOpenSupportchat}
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
        title="Open Support Agent Help Desk"
      >
        <img
          alt="Support headshot avatar"
          className="w-8 h-8 rounded-full border border-blue-400 object-cover ring-2 ring-white"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTGfS3cEGwSdGHDpZygaZHGvsFDG9hJ_mxMdfuCR9-6-rHjngZY3OJTrZVbAe1naOlohIYGfK15ABf9PYuOClXXBjsA6Oir3ftkGivisjWfUXralh-xgdoaaybgiL3dvTZhkmNEze9bcCAZeVBfArYUPUZNplkkgrowcQFi3u-mMPOzCWyL7JoBCxT3eulu3aBJ1zk_H6Xa4Cu7zVJe4Zagkpr2h7BVhiIIiqr8U2iNAIHQ8KIvpKdsCCuyRWsyZ0EhhxoiGvgcqc"
          onError={(e) => {
            (e.target as HTMLImageElement).src = initialsDataUri('Sarah Chen');
          }}
        />
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
      </button>

      {/* Figma Preview Modal */}
      {showFigmaPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/60">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Figma Prototype Simulation
              </span>
              <button
                onClick={() => setShowFigmaPreview(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                F
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Desktop Wireframes Mockup
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  You are viewing the simulated live wireframes. DevDale's
                  active layout is currently set to v1 Prototype standards.
                </p>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-2.5">
                <div className="h-6 bg-slate-100 dark:bg-slate-800/80 rounded" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-16 bg-slate-50 dark:bg-slate-800/50 rounded" />
                  <div className="h-16 bg-slate-50 dark:bg-slate-800/50 rounded" />
                  <div className="h-16 bg-slate-50 dark:bg-slate-800/50 rounded" />
                </div>
              </div>

              <button
                onClick={() => {
                  setShowFigmaPreview(false);
                  onTriggerAction('Opened external figma prototype view.');
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow"
              >
                Launch Live Figma Wireframes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
