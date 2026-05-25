import { LayoutDashboard, Briefcase, Bell, MessageSquare, User } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  unreadNotifications: number;
  onOpenNotifications?: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'notifications', label: 'Alerts', icon: Bell, modal: true },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'profile', label: 'Profile', icon: User },
] as const;

export default function MobileBottomNav({
  currentTab,
  onTabChange,
  unreadNotifications,
  onOpenNotifications,
}: MobileBottomNavProps) {
  const handleClick = (id: string, isModal?: boolean) => {
    if (isModal && onOpenNotifications) {
      onOpenNotifications();
    } else {
      onTabChange(id);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 md:hidden pb-[env(safe-area-inset-bottom,0px)]"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const showBadge = item.id === 'notifications' && unreadNotifications > 0;
          const isModal = item.id === 'notifications';

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (isModal && onOpenNotifications) {
                  onOpenNotifications();
                } else {
                  onTabChange(item.id);
                }
              }}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150 min-w-[56px] min-h-[44px] touch-manipulation active:scale-95 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {showBadge && (
                <span className="absolute -top-0.5 right-1.5 w-4.5 h-4.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-[8px] font-bold text-white leading-none">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-sm' : ''}`} />
              <span className={`text-[10px] font-semibold leading-tight ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
