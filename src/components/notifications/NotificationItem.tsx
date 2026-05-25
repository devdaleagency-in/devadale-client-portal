import { memo } from 'react';
import {
  Bell,
  MessageSquare,
  Upload,
  DollarSign,
  CheckSquare,
  AlertTriangle,
  Activity,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import type { AppNotification } from '../../types';
import { initialsDataUri } from '../../utils/avatar';

interface NotificationItemProps {
  notification: AppNotification;
  onMarkRead?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onPreview?: (id: string) => void;
  onDownload?: (id: string) => void;
  onAction?: (id: string, action: string) => void;
}

const categoryConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  approval: { icon: CheckSquare, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  message: { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  upload: { icon: Upload, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/20' },
  billing: { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  task: { icon: CheckSquare, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/20' },
  system: { icon: AlertTriangle, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800' },
  activity: { icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
};

function NotificationItem({
  notification: n,
  onMarkRead,
  onApprove,
  onReject,
  onPreview,
  onDownload,
  onAction,
}: NotificationItemProps) {
  const cc = categoryConfig[n.category] || categoryConfig.activity;
  const Icon = cc.icon;

  const handleAction = () => {
    if (n.actionType === 'approve') {
      onApprove?.(n.id);
      onAction?.(n.id, 'approve');
    } else if (n.actionType === 'reject') {
      onReject?.(n.id);
      onAction?.(n.id, 'reject');
    } else if (n.actionType === 'preview') {
      onPreview?.(n.id);
      onAction?.(n.id, 'preview');
    } else if (n.actionType === 'download') {
      onDownload?.(n.id);
      onAction?.(n.id, 'download');
    } else if (n.actionType === 'view') {
      onAction?.(n.id, 'view');
    }
  };

  return (
    <div
      className={`group relative flex gap-3 px-4 py-3 transition-all ${
        !n.read
          ? 'bg-blue-50/40 dark:bg-blue-950/10 border-l-2 border-l-blue-500'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/30 border-l-2 border-l-transparent'
      }`}
      role="button"
      tabIndex={0}
      onClick={() => onMarkRead?.(n.id)}
      onKeyDown={(e) => { if (e.key === 'Enter') onMarkRead?.(n.id); }}
      aria-label={`${n.title}. ${n.read ? 'Read' : 'Unread'}. ${n.message}`}
    >
      {/* Type Icon or Avatar */}
      {n.actor?.avatarUrl ? (
        <div className="relative shrink-0 mt-0.5">
          <img
            src={n.actor.avatarUrl}
            alt={n.actor.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
            onError={(e) => { (e.target as HTMLImageElement).src = initialsDataUri(n.actor?.name || ''); }}
          />
          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${cc.bg} flex items-center justify-center ring-2 ring-white dark:ring-slate-900`}>
            <Icon className={`w-2 h-2 ${cc.color}`} />
          </div>
        </div>
      ) : (
        <div className={`w-8 h-8 rounded-full ${cc.bg} flex items-center justify-center shrink-0 mt-0.5`}>
          <Icon className={`w-4 h-4 ${cc.color}`} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-xs font-bold truncate ${!n.read ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
              {n.title}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
              {n.message}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[9px] text-slate-400 whitespace-nowrap font-mono">{n.timestamp}</span>
            {!n.read && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            )}
          </div>
        </div>

        {/* Action buttons for actionable notifications */}
        {n.actionable && n.actionType && (
          <div className="flex items-center gap-1.5 mt-2">
            {n.actionType === 'approve' && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onApprove?.(n.id); onAction?.(n.id, 'approve'); }}
                  className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 rounded-lg transition-all active:scale-95"
                >
                  <CheckCircle className="w-3 h-3" />
                  Approve
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onReject?.(n.id); onAction?.(n.id, 'reject'); }}
                  className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-lg transition-all active:scale-95"
                >
                  <XCircle className="w-3 h-3" />
                  Reject
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onPreview?.(n.id); }}
                  className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-all"
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </button>
              </>
            )}
            {n.actionType === 'preview' && (
              <button
                onClick={(e) => { e.stopPropagation(); handleAction(); }}
                className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40 rounded-lg transition-all active:scale-95"
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
            )}
            {n.actionType === 'download' && (
              <button
                onClick={(e) => { e.stopPropagation(); onDownload?.(n.id); onAction?.(n.id, 'download'); }}
                className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40 rounded-lg transition-all active:scale-95"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
            )}
            {n.actionType === 'view' && (
              <button
                onClick={(e) => { e.stopPropagation(); handleAction(); }}
                className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40 rounded-lg transition-all active:scale-95"
              >
                <ExternalLink className="w-3 h-3" />
                View Details
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hover chevron */}
      <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-400 transition-colors self-center shrink-0 opacity-0 group-hover:opacity-100" />
    </div>
  );
}

export default memo(NotificationItem);
