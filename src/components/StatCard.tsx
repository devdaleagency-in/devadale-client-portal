import { type ReactNode } from 'react';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  variant?: 'primary' | 'secondary' | 'tertiary';
  trend?: { value: string; direction: 'up' | 'down'; positive?: boolean };
  badge?: string;
  badgeColor?: string;
  children?: ReactNode;
  onClick?: () => void;
}

const variantStyles = {
  primary: {
    container:
      'col-span-2 bg-white dark:bg-slate-900 border-t-4 border-blue-500 dark:border-blue-400 rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl',
    iconWrapper:
      'p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400',
    value:
      'text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white',
    label: 'text-[10px] font-bold tracking-wider text-slate-400 uppercase',
  },
  secondary: {
    container:
      'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md',
    iconWrapper:
      'p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400',
    value:
      'text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white',
    label: 'text-[10px] font-bold tracking-wider text-slate-400 uppercase',
  },
  tertiary: {
    container:
      'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 shadow-none hover:shadow-sm',
    iconWrapper: '',
    value: 'text-sm lg:text-base font-bold text-slate-900 dark:text-white',
    label: 'text-[10px] font-bold tracking-wider text-slate-400 uppercase',
  },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  variant = 'secondary',
  trend,
  badge,
  badgeColor = 'text-blue-600 bg-blue-50 dark:bg-blue-900/40',
  children,
  onClick,
}: StatCardProps) {
  const s = variantStyles[variant];

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`${s.container} flex flex-col justify-between relative overflow-hidden group transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className={s.iconWrapper}>
          <Icon className="w-5 h-5" />
        </div>
        {badge && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className={s.label}>{label}</p>
        <h3 className={`${s.value} mt-1`}>{value}</h3>
        {trend && (
          <div
            className={`text-[10px] font-semibold mt-1.5 flex items-center gap-1 ${
              (trend.positive ?? trend.direction === 'up')
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
