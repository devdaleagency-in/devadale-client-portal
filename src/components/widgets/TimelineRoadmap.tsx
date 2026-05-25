import { Check, Circle, ArrowRight, MapPin } from 'lucide-react';

interface Milestone {
  id: string;
  label: string;
  date: string;
  status: 'completed' | 'active' | 'planned';
  description?: string;
}

interface TimelineRoadmapProps {
  milestones: Milestone[] | null;
  loading?: boolean;
  title?: string;
  onMilestoneClick?: (id: string) => void;
}

function Skeleton() {
  return (
    <div className="relative">
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700 animate-pulse" />
      <div className="space-y-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 relative">
            <div className="relative z-10 w-[22px] h-[22px] rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
            <div className="flex-1 min-w-0 pb-1 space-y-1.5">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-2/3" />
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TimelineRoadmap({ milestones, loading, title = 'Project Roadmap', onMilestoneClick }: TimelineRoadmapProps) {
  const completed = milestones ? milestones.filter((m) => m.status === 'completed').length : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{title}</h3>
        </div>
        {!loading && milestones && (
          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">
            {completed}/{milestones.length}
          </span>
        )}
      </div>

      {loading ? (
        <Skeleton />
      ) : !milestones || milestones.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No milestones set</p>
          <p className="text-[10px] text-slate-400 mt-1">Create milestones to map out your project timeline.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />

          <div className="space-y-5">
            {milestones.map((m) => {
              const isComp = m.status === 'completed';
              const isActive = m.status === 'active';

              return (
                <div
                  key={m.id}
                  role={onMilestoneClick ? 'button' : undefined}
                  tabIndex={onMilestoneClick ? 0 : undefined}
                  onClick={() => onMilestoneClick?.(m.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && onMilestoneClick) onMilestoneClick(m.id); }}
                  className={`flex gap-4 relative group ${onMilestoneClick ? 'cursor-pointer' : ''}`}
                >
                  <div className={`relative z-10 w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isComp
                      ? 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]'
                      : isActive
                      ? 'bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.15)] ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}>
                    {isComp ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : isActive ? (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    ) : (
                      <Circle className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pb-1">
                    <div className={`text-xs font-bold ${
                      isComp ? 'text-slate-500 dark:text-slate-400' : isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {m.label}
                    </div>
                    {m.description && (
                      <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{m.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9px] font-mono ${isComp ? 'text-slate-400' : isActive ? 'text-blue-500 font-bold' : 'text-slate-400'}`}>
                        {m.date}
                      </span>
                      {isActive && (
                        <span className="text-[8px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-1.5 py-0.5 rounded-full">
                          In Progress
                        </span>
                      )}
                    </div>
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
