import { memo } from 'react';
import { Bell, BellDot } from 'lucide-react';

interface NotificationBellProps {
  unreadCount: number;
  isOpen: boolean;
  onClick: () => void;
}

function NotificationBell({ unreadCount, isOpen, onClick }: NotificationBellProps) {
  const hasUrgent = unreadCount > 0;

  return (
    <button
      onClick={onClick}
      className={`relative p-1.5 rounded-lg transition-all ${
        isOpen
          ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
          : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
      title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
    >
      {hasUrgent ? (
        <span className="relative inline-flex">
          <BellDot className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[8px] font-bold text-white bg-red-500 rounded-full leading-none shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
      ) : (
        <span className="relative inline-flex">
          <Bell className="w-4 h-4" />
        </span>
      )}

      {/* Pulse ring for unread */}
      {hasUrgent && (
        <span className="absolute inset-0 rounded-lg animate-ping opacity-20 bg-blue-400 dark:bg-blue-500 pointer-events-none" />
      )}
    </button>
  );
}

export default memo(NotificationBell);
