import { useEffect, useRef, useState } from 'react';
import { Sparkles, Sliders, Moon, Sun, ChevronDown, User, Layers, FileText, X, Camera, Trash2 } from 'lucide-react';
import type { User as AppUser, AppNotification } from '../types';
import { initialsDataUri } from '../utils/avatar';
import SearchBar from './SearchBar';
import NotificationBell from './notifications/NotificationBell';
import NotificationDropdown from './notifications/NotificationDropdown';

interface HeaderProps {
  currentRole: 'admin' | 'client' | 'onboarding';
  currentUser: AppUser | null;
  setRole: (role: 'admin' | 'client' | 'onboarding') => void;
  currentTab?: string;
  onQuickAction: () => void;
  setCurrentTab?: (tab: string) => void;
  onOpenSearch: () => void;
  onSignOut?: () => void;
  onUpdateAvatar?: (file: File) => void;
  onRemoveAvatar?: () => void;
  isMobileSidebarOpen?: boolean;
  onToggleMobileSidebar?: () => void;
  onToggleSupport?: () => void;
  // Notification props
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onApproveNotification?: (id: string) => void;
  onRejectNotification?: (id: string) => void;
  onPreviewNotification?: (id: string) => void;
  onDownloadNotification?: (id: string) => void;
  onNotificationAction?: (id: string, action: string) => void;
  onOpenNotificationCenter: () => void;
}

export default function Header({
  currentRole,
  currentUser,
  setRole,
  onQuickAction,
  setCurrentTab,
  onOpenSearch,
  onSignOut,
  onUpdateAvatar,
  onRemoveAvatar,
  isMobileSidebarOpen,
  onToggleMobileSidebar,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onApproveNotification,
  onRejectNotification,
  onPreviewNotification,
  onDownloadNotification,
  onNotificationAction,
  onOpenNotificationCenter,
}: HeaderProps) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    const nextIsDark = !html.classList.contains('dark');

    if (nextIsDark) {
      html.classList.remove('light');
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
    }

    setIsDarkMode(nextIsDark);
  };

  const handleRoleSelect = (role: 'admin' | 'client' | 'onboarding') => {
    setRole(role);
    setShowRoleDropdown(false);
  };

  return (
    <header className="sticky top-0 z-30 flex justify-between items-center w-full px-2 sm:px-4 lg:px-8 py-2.5 sm:py-3 bg-white dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm gap-2" id="portal-header">
      {/* Hamburger + Search */}
      <div className="flex items-center gap-2 flex-1 min-w-0 md:flex-none md:w-1/3 md:min-w-[200px]">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors -ml-1"
          aria-label={isMobileSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileSidebarOpen}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div className="flex-1 md:flex-none">
          <SearchBar onOpen={onOpenSearch} />
        </div>
      </div>

      {/* Action Tray */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4">
        {/* Role Selector Trigger - Only visible for actual admin users */}
        {currentUser?.role === 'admin' && (
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Switch Testing Profile View"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">
                {currentRole === 'admin' && "Agency Dashboard"}
                {currentRole === 'client' && "Client Workspace"}
                {currentRole === 'onboarding' && "Onboarding Form"}
              </span>
              <span className="sm:hidden">
                {currentRole === 'admin' && "Agency"}
                {currentRole === 'client' && "Client"}
                {currentRole === 'onboarding' && "Onboarding"}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowRoleDropdown(false)}
                />
                <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1.5 z-20 animate-in fade-in duration-100">
                  <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                    Change Perspective
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('admin')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                      currentRole === 'admin'
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <div className="font-medium">Agency Dashboard</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">Monitor projects and client activity</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('client')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <div className="font-medium">Client Workspace (Alex)</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">Track deadlines, agreements, roadmap</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('onboarding')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                      currentRole === 'onboarding'
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <div className="font-medium">Business Onboarding Form</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">Simulate registration and assets upload</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Quick Action Button */}
        <button
          onClick={onQuickAction}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-sm hover:shadow"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-100" />
          <span className="hidden sm:inline">Quick Action</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Toggle system theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Icon Button */}
        <div className="relative">
          <NotificationBell
            unreadCount={notifications.filter((n) => !n.read).length}
            isOpen={showNotifications}
            onClick={() => setShowNotifications(!showNotifications)}
          />
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              <NotificationDropdown
                notifications={notifications}
                onMarkRead={onMarkNotificationRead}
                onMarkAllRead={onMarkAllNotificationsRead}
                onApprove={onApproveNotification}
                onReject={onRejectNotification}
                onPreview={onPreviewNotification}
                onDownload={onDownloadNotification}
                onAction={onNotificationAction}
                onViewAll={onOpenNotificationCenter}
                onClose={() => setShowNotifications(false)}
              />
            </>
          )}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* User Badge Profile Avatar */}
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
            aria-label="User profile menu"
          >
            <div className="relative group">
              <img
                alt="User avatar"
                className="w-8 h-8 rounded-full border border-blue-100 dark:border-slate-700 object-cover ring-2 ring-blue-500/15"
                src={currentUser?.avatarUrl || initialsDataUri(currentUser?.name || 'User')}
                onError={(e) => { (e.target as HTMLImageElement).src = initialsDataUri(currentUser?.name || 'User'); }}
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{currentUser?.name || 'User'}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">{currentUser?.title || ''}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
          </button>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpdateAvatar?.(file);
              e.target.value = '';
            }}
          />

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1.5 z-20 animate-in fade-in duration-100">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser?.name || 'User'}</p>
                  <p className="text-[10px] text-slate-500">{currentUser?.email || ''}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (setCurrentTab) setCurrentTab('profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-400" />
                  Change Photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onRemoveAvatar?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  Remove Photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (setCurrentTab) setCurrentTab('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (setCurrentTab) setCurrentTab('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  Account Settings
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onSignOut?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
