import { useState } from 'react';
import { Calendar, AlertTriangle, Clock, ChevronRight, ListChecks } from 'lucide-react';
import { Deadline } from '../../types';

interface UpcomingDeadlinesProps {
  deadlines: Deadline[];
  loading?: boolean;
}

const priorityConfig = {
  critical: { dot: 'bg-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800/40', label: 'Overdue' },
  high: { dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/40', label: 'High' },
  medium: { dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/40', label: 'Medium' },
  low: { dot: 'bg-slate-400', bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700', label: 'Low' },
};

const filters = [
  { key: 'all', label: 'All' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'today', label: 'Today' },
  { key: 'this-week', label: 'This Week' },
] as const;

function getDaysUntil(dueDate: string): string {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Tomorrow';
  return `${diff}d left`;
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl">
          <div className="mt-1 w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3" />
              <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-14 shrink-0" />
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UpcomingDeadlines({ deadlines, loading }: UpcomingDeadlinesProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filtered = activeFilter === 'all'
    ? deadlines
    : deadlines.filter((d) => d.status === activeFilter);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Upcoming Deadlines
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">
          {deadlines.length}
        </span>
      </div>

      <div className="flex gap-1 mb-3">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
              activeFilter === f.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonRows />
      ) : deadlines.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
            <ListChecks className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">All clear!</p>
          <p className="text-[10px] text-slate-400 mt-1">No deadlines due. Enjoy the breather.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((dl) => {
            const pc = priorityConfig[dl.priority] || priorityConfig.medium;
            const daysLeft = getDaysUntil(dl.dueDate);
            const isUrgent = dl.status === 'overdue' || dl.status === 'today';

            return (
              <div
                key={dl.id}
                className={`group flex items-start gap-3 p-2.5 rounded-xl border transition-all hover:shadow-sm ${
                  isUrgent ? pc.bg + ' ' + pc.border : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${pc.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-bold truncate ${isUrgent ? pc.text : 'text-slate-700 dark:text-slate-200'}`}>
                      {dl.task}
                    </p>
                    <span className={`text-[9px] font-mono font-bold whitespace-nowrap shrink-0 ${
                      dl.status === 'overdue' ? 'text-rose-500' : dl.status === 'today' ? 'text-amber-500' : 'text-slate-400'
                    }`}>
                      {daysLeft}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-slate-400 truncate">{dl.project}</span>
                    <span className="text-[9px] text-slate-300">•</span>
                    <span className="text-[9px] text-slate-400">{dl.assignee}</span>
                  </div>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-400 transition-colors mt-1 shrink-0 opacity-0 group-hover:opacity-100" />
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-xs">No deadlines match this filter.</div>
          )}
        </div>
      )}
    </div>
  );
}
