import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  SlidersHorizontal,
  Search,
  BellOff,
  ExternalLink,
} from 'lucide-react';
import type { AppNotification, NotificationCategory } from '../../types';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onPreview?: (id: string) => void;
  onDownload?: (id: string) => void;
  onAction?: (id: string, action: string) => void;
  onViewAll?: () => void;
  onClose: () => void;
}

const categoryTabs: { key: NotificationCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'approval', label: 'Approvals' },
  { key: 'message', label: 'Messages' },
  { key: 'upload', label: 'Uploads' },
  { key: 'billing', label: 'Billing' },
  { key: 'task', label: 'Tasks' },
  { key: 'system', label: 'System' },
  { key: 'activity', label: 'Activity' },
];

function NotificationSkeleton() {
  return (
    <div className="space-y-1 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3" />
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-full" />
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationDropdown({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onApprove,
  onReject,
  onPreview,
  onDownload,
  onAction,
  onViewAll,
  onClose,
}: NotificationDropdownProps) {
  const [activeTab, setActiveTab] = useState<NotificationCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const filtered = useMemo(() => {
    let result = notifications;

    if (activeTab !== 'all') {
      result = result.filter((n) => n.category === activeTab);
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
  }, [notifications, activeTab, searchQuery]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  return (
    <div
      ref={panelRef}
      className="fixed inset-0 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[380px] lg:w-[420px] bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-slate-700/80 sm:rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col"

      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
    >
      {/* Mobile header */}
      <div className="flex sm:hidden items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 shrink-0">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Notifications</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close notifications"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="text-[9px] font-bold text-white bg-blue-600 px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded-lg transition-all ${
              showSearch
                ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-label="Search notifications"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-all"
              aria-label="Mark all as read"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Search notifications"
            />
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-none border-b border-slate-100 dark:border-slate-800/50">
        <SlidersHorizontal className="w-3 h-3 text-slate-400 shrink-0 mr-0.5" />
        {categoryTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-2 py-1 text-[9px] font-bold rounded-lg whitespace-nowrap transition-all shrink-0 ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="max-h-[360px] overflow-y-auto overscroll-contain">
        {isLoading ? (
          <NotificationSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <BellOff className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {searchQuery ? 'No matching notifications' : 'All caught up!'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 text-center">
              {searchQuery
                ? 'Try a different search term or filter.'
                : 'You have no unread notifications in this category.'}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((n) => (
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
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
        <span className="text-[9px] text-slate-400">
          {unreadCount > 0
            ? `${unreadCount} unread`
            : 'No unread'}
        </span>
        <button
          onClick={() => { onViewAll?.(); onClose(); }}
          className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          View all notifications
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
