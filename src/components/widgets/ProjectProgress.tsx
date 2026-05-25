import { Project } from '../../types';
import { CheckCircle2, Circle, ArrowRight, BarChart3 } from 'lucide-react';

interface ProjectProgressProps {
  project: Project | null;
  loading?: boolean;
  milestones?: { label: string; completed: boolean }[];
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
        <div className="flex-1 grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 space-y-1.5">
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/3" />
            </div>
          ))}
        </div>
      </div>
      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1.5">
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-20" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3" />
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/3" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

const defaultMilestones = [
  { label: 'Discovery & Research', completed: true },
  { label: 'Concept Development', completed: true },
  { label: 'UI/UX Design', completed: false },
  { label: 'Prototype & Testing', completed: false },
  { label: 'Development', completed: false },
  { label: 'Launch & Handoff', completed: false },
];

export default function ProjectProgress({ project, loading, milestones }: ProjectProgressProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
          Project Progress
        </h3>
        <Skeleton />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm">
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No project selected</p>
          <p className="text-[10px] text-slate-400 mt-1">Open a project to track progress.</p>
        </div>
      </div>
    );
  }

  const totalTasks = 12;
  const completedTasks = Math.round((project.progress / 100) * totalTasks);
  const remainingTasks = totalTasks - completedTasks;

  const ms = milestones || defaultMilestones;
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (project.progress / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm">
      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
        Project Progress
      </h3>

      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="4" className="dark:stroke-slate-700" />
            <circle
              cx="32" cy="32" r="28"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{project.progress}%</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Completed</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{completedTasks}</p>
            <p className="text-[9px] text-slate-400">tasks</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Remaining</p>
            <p className="text-lg font-black text-slate-500 dark:text-slate-300">{remainingTasks}</p>
            <p className="text-[9px] text-slate-400">tasks</p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-2.5 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
        <p className="text-[9px] text-blue-600 dark:text-blue-400 uppercase tracking-wider font-bold">Current Phase</p>
        <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mt-0.5">{project.stage}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[9px] text-blue-500">Est. completion:</span>
          <span className="text-[9px] font-bold text-blue-600">{project.nextMilestoneDate}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {ms.slice(0, 4).map((m) => (
          <div key={m.label} className="flex items-center gap-2">
            {m.completed ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
            )}
            <span className={`text-[10px] font-semibold ${m.completed ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {m.label}
            </span>
            {m.completed && <ArrowRight className="w-2.5 h-2.5 text-slate-300 ml-auto" />}
          </div>
        ))}
      </div>
    </div>
  );
}
