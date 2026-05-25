import { MessageSquare, Upload, CheckCircle, RefreshCw, CheckSquare, User, Activity } from 'lucide-react';
import { TeamActivity } from '../../types';

interface TeamActivityFeedProps {
  activities: TeamActivity[] | null;
  loading?: boolean;
  maxItems?: number;
}

const actionIcons: Record<string, { icon: typeof MessageSquare; color: string; bg: string }> = {
  comment: { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  upload: { icon: Upload, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/20' },
  approval: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  update: { icon: RefreshCw, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  task: { icon: CheckSquare, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/20' },
};

function Skeleton() {
  return (
    <div className="relative">
      <div className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700 animate-pulse" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 relative">
            <div className="relative z-10 w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0 ring-2 ring-white dark:ring-slate-900" />
            <div className="flex-1 min-w-0 pt-0.5 space-y-1.5">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3" />
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeamActivityFeed({ activities, loading, maxItems = 5 }: TeamActivityFeedProps) {
  const display = activities ? activities.slice(0, maxItems) : [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Team Activity
          </h3>
        </div>
        {!loading && activities && (
          <span className="text-[9px] text-slate-400 font-mono">Live</span>
        )}
      </div>

      {loading ? (
        <Skeleton />
      ) : !activities || activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No recent activity</p>
          <p className="text-[10px] text-slate-400 mt-1">Team activity will show up here in real time.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="space-y-4">
            {display.map((act) => {
              const ac = actionIcons[act.type] || actionIcons.comment;
              const Icon = ac.icon;

              return (
                <div key={act.id} className="flex gap-3 relative group">
                  <div className={`relative z-10 w-7 h-7 rounded-full ${ac.bg} flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-slate-900`}>
                    <Icon className={`w-3.5 h-3.5 ${ac.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-xs text-slate-700 dark:text-slate-200">
                      <span className="font-bold">{act.user.name}</span>
                      {' '}{act.action}{' '}
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{act.target}</span>
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{act.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
