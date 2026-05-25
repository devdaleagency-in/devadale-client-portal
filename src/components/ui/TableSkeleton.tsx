interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export default function TableSkeleton({ rows = 4, columns = 4, className = '' }: TableSkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-slate-200 dark:bg-slate-700 rounded"
            style={{ width: `${Math.max(60, 100 - i * 15)}px` }}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex gap-4 px-4 py-3.5 border-b border-slate-50 dark:border-slate-800/50"
        >
          {Array.from({ length: columns }).map((_, c) => (
            <div
              key={c}
              className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded"
              style={{ width: `${Math.max(50, 100 - c * 12)}px` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
