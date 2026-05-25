import { CheckCircle, XCircle, Clock, Eye, Inbox } from 'lucide-react';
import { ApprovalItem } from '../../types';

interface PendingApprovalsWidgetProps {
  approvals: ApprovalItem[];
  loading?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onPreview?: (item: ApprovalItem) => void;
}

const typeConfig: Record<string, { icon: string; bg: string; text: string }> = {
  design: { icon: '🎨', bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-600 dark:text-purple-400' },
  content: { icon: '📝', bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400' },
  agreement: { icon: '📄', bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400' },
  milestone: { icon: '🏁', bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400' },
};

function SkeletonItems() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-800 p-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-14 shrink-0" />
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-3/4" />
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/3" />
              <div className="flex gap-1.5">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-14" />
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-14" />
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-14" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PendingApprovalsWidget({ approvals, loading, onApprove, onReject, onPreview }: PendingApprovalsWidgetProps) {
  const pending = approvals.filter((a) => a.status === 'pending');
  const recent = approvals.slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Pending Approvals
          </h3>
        </div>
        {!loading && pending.length > 0 && (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">
            {pending.length} waiting
          </span>
        )}
      </div>

      {loading ? (
        <SkeletonItems />
      ) : approvals.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Inbox zero!</p>
          <p className="text-[10px] text-slate-400 mt-1">All approvals are up to date.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map((item) => {
            const tc = typeConfig[item.type] || typeConfig.content;

            return (
              <div
                key={item.id}
                className="group rounded-xl border border-slate-100 dark:border-slate-800 p-3 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${tc.bg} flex items-center justify-center text-sm shrink-0`}>
                    {tc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                        {item.title}
                      </p>
                      <span className={`text-[9px] font-bold whitespace-nowrap shrink-0 px-1.5 py-0.5 rounded ${
                        item.status === 'approved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'
                          : item.status === 'rejected'
                          ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600'
                          : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'
                      }`}>
                        {item.status === 'approved' ? 'Approved' : item.status === 'rejected' ? 'Rejected' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-slate-400">{item.submittedBy}</span>
                      <span className="text-[9px] text-slate-300">•</span>
                      <span className="text-[9px] text-slate-400">{item.submittedAt}</span>
                    </div>

                    {item.status === 'pending' && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {onPreview && (
                          <button
                            onClick={() => onPreview(item)}
                            className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-all"
                          >
                            <Eye className="w-3 h-3" />
                            Preview
                          </button>
                        )}
                        <button
                          onClick={() => onApprove?.(item.id)}
                          className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-all"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => onReject?.(item.id)}
                          className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {recent.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-xs">No approvals to review.</div>
          )}
        </div>
      )}
    </div>
  );
}
