import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  X,
  CheckCheck,
  Search,
  BellOff,
  ArrowLeft,
  Filter,
  CalendarDays,
  Inbox,
} from 'lucide-react';
import type { AppNotification, NotificationCategory } from '../../types';
import NotificationItem from './NotificationItem';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onPreview?: (id: string) => void;
  onDownload?: (id: string) => void;
  onAction?: (id: string, action: string) => void;
}

type FilterKey = 'all' | 'unread' | 'project_updates' | 'messages' | 'deliverables' | 'invoices';

const filterTabs: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'project_updates', label: 'Project Updates' },
  { key: 'messages', label: 'Messages' },
  { key: 'deliverables', label: 'Deliverables' },
  { key: 'invoices', label: 'Invoices' },
];

const filterCategoryMap: Record<FilterKey, NotificationCategory[] | null> = {
  all: null,
  unread: null,
  project_updates: ['task', 'approval', 'activity'],
  messages: ['message'],
  deliverables: ['upload'],
  invoices: ['billing'],
};

const ITEMS_PER_PAGE = 10;

export default function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onApprove,
  onReject,
  onPreview,
  onDownload,
  onAction,
}: NotificationCenterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setSearchQuery('');
      setActiveFilter('all');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    let result = notifications;

    if (activeFilter === 'unread') {
      result = result.filter((n) => !n.read);
    } else {
      const categories = filterCategoryMap[activeFilter];
      if (categories) {
        result = result.filter((n) => categories.includes(n.category));
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          n.actor?.name.toLowerCase().includes(q) ||
          n.target?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [notifications, activeFilter, searchQuery]);

  const paginated = useMemo(
    () => filtered.slice(0, page * ITEMS_PER_PAGE),
    [filtered, page],
  );

  const hasMore = paginated.length < filtered.length;
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');

  const groupedByDate = useMemo(() => {
    if (viewMode !== 'grouped') return null;
    const groups: Record<string, AppNotification[]> = {};
    for (const n of paginated) {
      const label = n.timestamp.includes('ago') || n.timestamp.includes('Yesterday')
        ? 'Recent'
        : n.timestamp.includes('day')
        ? 'Older'
        : 'Recent';
      if (!groups[label]) groups[label] = [];
      groups[label].push(n);
    }
    return groups;
  }, [paginated, viewMode]);

  const showEmptyCTA = paginated.length === 0;

  if (!isOpen) return null;

  const modal = (
    <div className="fixed inset-0 z-[60] flex items-center sm:items-start justify-center sm:pt-[6vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative w-full sm:w-[600px] lg:w-[680px] h-full sm:h-auto max-h-full sm:max-h-[75vh] bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-slate-700/80 rounded-none sm:rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-label="Notification history"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/50">
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            aria-label="Close notification center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Bell className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex-1">
            Notification History
          </h2>
          <button
            onClick={onMarkAllRead}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-all"
            aria-label="Mark all as read"
            title="Mark all as read"
          >
            <CheckCheck className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search + Filter Tabs */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/50 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search notifications..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Search notifications"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveFilter(tab.key); setPage(1); }}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all shrink-0 ${
                  activeFilter === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {showEmptyCTA ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Inbox className="w-7 h-7 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                {activeFilter === 'unread' ? 'All caught up!' : searchQuery ? 'No matching notifications' : 'No notifications yet'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 text-center max-w-xs">
                {activeFilter === 'unread'
                  ? 'You\'ve read everything. New notifications will appear here.'
                  : searchQuery
                    ? 'Try adjusting your search or filter.'
                    : 'Notifications from project updates, approvals, and team activity will appear here.'}
              </p>
            </div>
          ) : viewMode === 'grouped' && groupedByDate ? (
            Object.entries(groupedByDate!).map(([label, items]) => {
              const groupItems = items as AppNotification[];
              return (
                <div key={label}>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50/50 dark:bg-slate-800/30">
                    <CalendarDays className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
                    <span className="text-[9px] font-mono text-slate-300 dark:text-slate-600">({groupItems.length})</span>
                  </div>
                  {groupItems.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onMarkRead={onMarkRead}
                      onApprove={onApprove}
                      onReject={onReject}
                      onPreview={onPreview}
                      onDownload={onDownload}
                      onAction={onAction}
                    />
                  ))}
                </div>
              );
            })
          ) : (
            <div>
              {paginated.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={onMarkRead}
                  onApprove={onApprove}
                  onReject={onReject}
                  onPreview={onPreview}
                  onDownload={onDownload}
                  onAction={onAction}
                />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && (
            <div className="px-4 py-3 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40 rounded-lg transition-all"
              >
                Load more ({filtered.length - paginated.length} remaining)
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-[10px] text-slate-400">
            {filtered.length} notification{filtered.length === 1 ? '' : 's'}
            {notifications.filter((n) => !n.read).length > 0 && (
              <> · {notifications.filter((n) => !n.read).length} unread</>
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grouped' : 'list')}
              className="text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              {viewMode === 'list' ? 'Group by date' : 'List view'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
