import { useState } from 'react';
import {
  Rocket,
  Clock,
  TrendingUp,
  CreditCard,
  MoreHorizontal,
  ArrowRight,
  ChevronRight,
  Plus,
  Activity,
  Lightbulb,
  Cpu,
  ShoppingBag,
  Palette,
  Leaf,
  BarChart3,
  FolderKanban,
  Zap,
  LifeBuoy,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { Project, Agreement, Metrics, ActivityFeed } from '../types';
import ProgressMeter from './ProgressMeter';
import StatCard from './StatCard';
import UpcomingDeadlines from './widgets/UpcomingDeadlines';
import InvoiceStatus from './widgets/InvoiceStatus';
import TeamActivityFeed from './widgets/TeamActivityFeed';
import { INITIAL_DEADLINES, INITIAL_INVOICES, INITIAL_TEAM_ACTIVITY } from '../data';
import LoadingSpinner from './ui/LoadingSpinner';
import SkeletonCard from './ui/SkeletonCard';
import EmptyState from './ui/EmptyState';
import ErrorState from './ui/ErrorState';

interface AdminConsoleProps {
  projects: Project[];
  metrics: Metrics;
  agreements: Agreement[];
  activity?: ActivityFeed[];
  msaStatus?: string;
  loading?: boolean;
  error?: string | null;
  onSignAgreement?: () => void;
  onProjectClick?: (project: Project) => void;
  onNewProjectClick: () => void;
  onGenerateAgreement: () => void;
  onTriggerAction: (msg: string) => void;
  setCurrentTab?: (tab: string) => void;
  onGenerateOnboardingLink?: () => void;
  onResetData?: () => void;
  currentUser?: any;
  onUpdateAvatar?: (file: File) => void;
  onRemoveAvatar?: () => void;
}

export default function AdminConsole({
  projects,
  metrics,
  agreements,
  loading,
  error,
  onProjectClick,
  onNewProjectClick,
  onGenerateAgreement,
  onTriggerAction,
  setCurrentTab,
  onGenerateOnboardingLink,
}: AdminConsoleProps) {
  const [selectedChartFilter, setSelectedChartFilter] = useState<
    'month' | 'quarter'
  >('month');
  const [showInsight, setShowInsight] = useState(true);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto w-full px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <SkeletonCard lines={2} />
            </div>
          ))}
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <SkeletonCard lines={4} />
          </div>
          <SkeletonCard lines={4} />
        </div>
        <SkeletonCard lines={2} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <SkeletonCard lines={3} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto w-full px-2">
        <ErrorState
          title="Failed to load dashboard"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const activeCount = projects.filter((p) => p.id !== 'proj-focus').length;
  const newCount = projects.length - 4 > 0 ? projects.length - 4 : 2;

  const chartData = {
    month: {
      path: 'M0,165 Q45,145 90,110 T180,75 T270,95 T360,20',
      fill: 'M0,165 Q45,145 90,110 T180,75 T270,95 T360,20 L360,200 L0,200 Z',
      labelValues: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      points: [
        { cx: 0, cy: 165, val: 'Week 1: Low Touchpoints' },
        { cx: 90, cy: 110, val: 'Week 2: Medium System' },
        { cx: 180, cy: 75, val: 'Week 3: Peak Draft design' },
        { cx: 360, cy: 20, val: 'Week 4: Release Launch' },
      ],
    },
    quarter: {
      path: 'M0,140 Q45,60 90,120 T180,45 T270,140 T360,95',
      fill: 'M0,140 Q45,60 90,120 T180,45 T270,140 T360,95 L360,200 L0,200 Z',
      labelValues: ['Month 1', 'Month 2', 'Month 3', 'Average'],
      points: [
        { cx: 0, cy: 140, val: 'Month 1: Kickoff' },
        { cx: 90, cy: 120, val: 'Month 2: UI Design' },
        { cx: 180, cy: 45, val: 'Month 3: QA Release' },
        { cx: 360, cy: 95, val: 'Month 4: Retrospective' },
      ],
    },
  };

  const currentChart = chartData[selectedChartFilter];

  const getProjectIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'palette':
        return <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'leaf':
        return (
          <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        );
      case 'cpu':
        return <Cpu className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'shoppingcart':
        return (
          <ShoppingBag className="w-4 h-4 text-rose-600 dark:text-rose-400" />
        );
      default:
        return (
          <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        );
    }
  };

  const SectionDivider = ({
    icon: Icon,
    title,
  }: {
    icon: typeof BarChart3;
    title: string;
  }) => (
    <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-8 mt-10">
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full px-2">
      {/* ─── Page Title ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">
            Analytics Overview_
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time performance operational metrics for the active client
            pipelines.
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setSelectedChartFilter('month')}
            className={`px-3 py-1 rounded-md transition-all ${
              selectedChartFilter === 'month'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setSelectedChartFilter('quarter')}
            className={`px-3 py-1 rounded-md transition-all ${
              selectedChartFilter === 'quarter'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Last Quarter
          </button>
        </div>
      </div>

      {/* ─── KPI Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={Rocket}
          label="Active Projects"
          value={activeCount}
          variant="primary"
          badge={`+${newCount} New`}
          trend={{ value: '4.2% from last month', direction: 'up' }}
        />

        <StatCard
          icon={Clock}
          label="Pending Approvals"
          value={metrics.pendingApprovals}
          badge="Critical Check"
          badgeColor="text-rose-600 bg-rose-50 dark:bg-rose-900/40"
          variant="secondary"
        >
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
            16.6% Allocation
          </p>
        </StatCard>

        <StatCard
          icon={TrendingUp}
          label="Team Velocity"
          value={`${metrics.teamProductivity}%`}
          badge="Target: 95%"
          badgeColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40"
          variant="secondary"
          trend={{ value: 'Operating at Peak Sprints', direction: 'up' }}
        />

        {/* Revenue — full-width primary with gradient bg */}
        <div className="col-span-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-200 text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />
          <div className="flex justify-between items-start relative">
            <div className="p-2 bg-white/10 rounded-xl text-white">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-wide text-blue-100 uppercase bg-white/15 px-2 py-0.5 rounded-full">
              Q3 Target
            </span>
          </div>
          <div className="mt-4 relative">
            <p className="text-[10px] font-bold tracking-wider text-blue-200 uppercase">
              Monthly Revenue
            </p>
            <h3 className="text-3xl lg:text-4xl font-black tracking-tight text-white mt-1">
              ${metrics.monthlyRevenue}k
            </h3>
            <div className="text-blue-100 text-[10px] font-semibold mt-1.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Projected margin target — +12.4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mini Stats Row ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Client Engagement',
            value: '87%',
            detail: '14 comments, 6 approvals this week',
          },
          {
            label: 'Upload Statistics',
            value: '312 files',
            detail: '98.4 GB protected',
          },
          {
            label: 'Delivery Performance',
            value: '94%',
            detail: 'Average milestone accuracy',
          },
          {
            label: 'Pending Revisions',
            value: '7',
            detail: '3 require admin review today',
          },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onTriggerAction(`${item.label} analytics opened.`)}
            className="text-left bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 hover:shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition-all group"
          >
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {item.label}
            </p>
            <p className="text-sm lg:text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {item.value}
            </p>
            <p className="text-[9px] text-slate-400 mt-0.5">{item.detail}</p>
          </button>
        ))}
      </div>

      {/* ─── Section: Analytics & Charts ─── */}
      <SectionDivider icon={BarChart3} title="Analytics & Charts" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="md:col-span-2 lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col transition-colors">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Client Engagement
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Average digital touchpoints per active milestone over time
              </p>
            </div>
            <button
              type="button"
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-50 transition-colors"
              aria-label="Chart options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="relative h-48 w-full group">
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 360 200"
            >
              <defs>
                <linearGradient
                  id="chartLineGradient"
                  x1="0%"
                  x2="0%"
                  y1="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line
                x1="0"
                y1="50"
                x2="360"
                y2="50"
                stroke="#F1F5F9"
                strokeDasharray="4"
                className="dark:stroke-slate-800"
              />
              <line
                x1="0"
                y1="100"
                x2="360"
                y2="100"
                stroke="#F1F5F9"
                strokeDasharray="4"
                className="dark:stroke-slate-800"
              />
              <line
                x1="0"
                y1="150"
                x2="360"
                y2="150"
                stroke="#F1F5F9"
                strokeDasharray="4"
                className="dark:stroke-slate-800"
              />
              <path
                d={currentChart.fill}
                fill="url(#chartLineGradient)"
                className="transition-all duration-700 ease-in-out"
              />
              <path
                d={currentChart.path}
                fill="none"
                stroke="#2563EB"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-700 ease-in-out"
              />
              {currentChart.points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.cx}
                    cy={pt.cy}
                    r="4.5"
                    fill="#2563EB"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="cursor-pointer hover:r-6 transition-all"
                  />
                  <title>{pt.val}</title>
                </g>
              ))}
            </svg>
            <div className="absolute bottom-[-18px] left-0 right-0 flex justify-between text-[9px] font-bold text-slate-400 px-1 font-mono uppercase">
              {currentChart.labelValues.map((lbl) => (
                <span key={lbl}>{lbl}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm flex flex-col h-full justify-between transition-colors">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
              Resource Allocation
            </h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    Design Studio
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    88%
                  </span>
                </div>
                <ProgressMeter
                  value={88}
                  label="Design Studio allocation"
                  className="progress-meter--tall"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    Engineering Sprints
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    94%
                  </span>
                </div>
                <ProgressMeter
                  value={94}
                  label="Engineering Sprints allocation"
                  variant="emerald"
                  className="progress-meter--tall"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    Governance & PMO
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                    62%
                  </span>
                </div>
                <ProgressMeter
                  value={62}
                  label="Governance and PMO allocation"
                  variant="amber"
                  className="progress-meter--tall"
                />
              </div>
            </div>
          </div>
          {showInsight && (
            <div className="mt-5 p-3 rounded-lg bg-blue-50/50 dark:bg-slate-800/40 border border-blue-100/30 dark:border-slate-700/60 flex items-start gap-3 animate-in fade-in">
              <div className="p-1 px-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                Team is peaking in productivity. Consider adding 2 projects or
                onboarding new design blocks.
              </div>
              <button
                onClick={() => setShowInsight(false)}
                className="text-[10px] text-slate-400 hover:text-slate-600 font-bold px-1"
                title="Dismiss tip"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Section: Active Projects ─── */}
      <SectionDivider icon={FolderKanban} title="Active Projects" />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm transition-colors">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 flex justify-between items-center">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Project Health Monitor
          </h4>
          <button
            type="button"
            onClick={() => {
              if (setCurrentTab) setCurrentTab('projects');
              else
                onTriggerAction(
                  'Redirecting you to active Projects table search. Use search bar to filter directly!'
                );
            }}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 group transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        <div className="overflow-x-auto -mx-4 sm:-mx-0">
          <div className="min-w-[600px] px-4 sm:px-0">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800">
                <th className="px-3 sm:px-5 py-3.5 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                  Client Name
                </th>
                <th className="px-3 sm:px-5 py-3.5 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                  Project Stage
                </th>
                <th className="px-3 sm:px-5 py-3.5 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] text-center">
                  Health
                </th>
                <th className="px-3 sm:px-5 py-3.5 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                  Last Update
                </th>
                <th className="px-3 sm:px-5 py-3.5 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {projects.filter((p) => p.id !== 'proj-focus').length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8">
                    <div className="flex flex-col items-center justify-center text-center">
                      <FolderOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-xs font-semibold text-slate-500">No active projects</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Create a project to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                projects
                .filter((p) => p.id !== 'proj-focus')
                .map((proj) => (
                  <tr
                    key={proj.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors group cursor-pointer"
                    onClick={() => onProjectClick?.(proj)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-100/10 flex items-center justify-center shrink-0">
                          {getProjectIcon(proj.iconName)}
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                          {proj.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-[10px] rounded uppercase">
                        {proj.stage}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex justify-center">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            proj.health === 'healthy'
                              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                              : proj.health === 'warning'
                              ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                              : 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                          }`}
                        />
                      </div>
                    </td>
                    <td className="text-slate-500 dark:text-slate-400 px-5 py-3.5">
                      {proj.lastUpdated}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        className="p-1 text-slate-400 group-hover:text-blue-600 rounded-lg transition-all"
                        aria-label={`Open ${proj.name}`}
                        onClick={() => onProjectClick?.(proj)}
                      >
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* ─── Section: Quick Actions ─── */}
      <SectionDivider icon={Zap} title="Quick Actions" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:shadow-sm transition-shadow">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Secure Link Center
          </h4>
          <p className="text-[11px] text-slate-400 mt-1">
            Generate expiring project URLs, OTP sessions, and role-scoped
            access.
          </p>
          <button
            onClick={() => onGenerateOnboardingLink?.()}
            className="mt-4 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-xs font-bold transition-colors"
          >
            Generate Client Link
          </button>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 hover:shadow-sm transition-shadow">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Security Controls
          </h4>
          <div className="mt-3 space-y-2">
            {[
              'JWT sessions',
              'Rate limiting',
              'Secure uploads',
              'Encrypted storage',
              'Activity logs',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {item}
                </span>
                <span className="text-emerald-600 font-black">Active</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 hover:shadow-sm transition-shadow">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Automation Queue
          </h4>
          <p className="text-[11px] text-slate-400 mt-1">
            Email automation, WhatsApp notifications, invoices, calendar
            scheduling, and AI summaries.
          </p>
          <button
            onClick={() =>
              onTriggerAction(
                'AI project summary drafted and notification automations queued.'
              )
            }
            className="mt-4 w-full rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
          >
            Run Smart Summary
          </button>
        </div>
      </div>

      {/* ─── Section: Agreements ─── */}
      <SectionDivider icon={LifeBuoy} title="Agreements" />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm transition-colors">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 flex justify-between items-center">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Agreements Overview
          </h4>
          <button
            type="button"
            onClick={() => {
              onGenerateAgreement();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-bold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Agreement</span>
          </button>
        </div>
        <div className="overflow-x-auto -mx-4 sm:-mx-0">
          <div className="min-w-[600px] px-4 sm:px-0">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800">
                <th className="px-3 sm:px-5 py-3.5 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                  Agreement Name
                </th>
                <th className="px-3 sm:px-5 py-3.5 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                  Client
                </th>
                <th className="px-3 sm:px-5 py-3.5 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] text-center">
                  Status
                </th>
                <th className="px-3 sm:px-5 py-3.5 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                  Last Activity
                </th>
                <th className="px-3 sm:px-5 py-3.5 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {agreements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8">
                    <div className="flex flex-col items-center justify-center text-center">
                      <FolderOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-xs font-semibold text-slate-500">No agreements yet</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Generate an agreement to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                agreements.map((agree) => (
                <tr
                  key={agree.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors"
                >
                  <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                    {agree.name}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                    {agree.client}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex justify-center">
                      <span
                        className={`px-2 py-0.5 font-bold text-[9px] rounded uppercase tracking-wide border ${
                          agree.status === 'signed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : agree.status === 'pending'
                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/70'
                            : 'bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {agree.status === 'signed'
                          ? 'Signed'
                          : agree.status === 'pending'
                          ? 'Pending Signature'
                          : 'Draft'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                    {agree.date}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {agree.status === 'pending' ? (
                      <button
                        onClick={() =>
                          onTriggerAction(
                            `Sent signature reminder to stakeholders at ${agree.client}.`
                          )
                        }
                        className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
                      >
                        Send Reminder
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          onTriggerAction(
                            `Viewing completed system agreement draft of ${agree.name}.`
                          )
                        }
                        className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
      {/* ─── Section: Team Collaboration ─── */}
      <SectionDivider icon={RefreshCw} title="Team Collaboration" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        <div className="md:col-span-1 lg:col-span-5">
          <UpcomingDeadlines deadlines={INITIAL_DEADLINES} />
        </div>
        <div className="md:col-span-1 lg:col-span-4">
          <InvoiceStatus
            invoices={INITIAL_INVOICES}
            onPay={(inv) => onTriggerAction(`Processing payment for ${inv.number}.`)}
            onDownload={(inv) => onTriggerAction(`Downloading invoice ${inv.number}.`)}
          />
        </div>
        <div className="md:col-span-1 lg:col-span-3">
          <TeamActivityFeed activities={INITIAL_TEAM_ACTIVITY} maxItems={5} />
        </div>
      </div>
    </div>
  );
}
