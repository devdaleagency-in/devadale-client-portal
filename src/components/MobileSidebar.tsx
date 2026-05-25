import { useEffect, useRef } from 'react';
import { X, LayoutDashboard, Briefcase, Calendar, MessageSquare, ScrollText, FileCheck, Settings, Palette, User, Plus, Receipt, Bell, LifeBuoy, Users, ClipboardList, Database, UserPlus, BarChart3, CreditCard, Puzzle } from 'lucide-react';
import BrandLogo from './BrandLogo';
import RippleButton from './RippleButton';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: 'admin' | 'client' | 'onboarding';
  onNewProjectClick: () => void;
}

const mainTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'deliverables', label: 'Deliverables', icon: FileCheck },
];

const operationsTabs = [
  { id: 'clients', label: 'Clients', icon: UserPlus },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

const workspaceTabs = [
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: 3 },
  { id: 'support', label: 'Support Center', icon: LifeBuoy },
];

const collaborationTabs = [
  { id: 'team', label: 'Team Access', icon: Users },
  { id: 'meetings', label: 'Meeting Notes', icon: ClipboardList },
];

const adminTabs = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'branding', label: 'Portal Config', icon: Palette },
  { id: 'system', label: 'System', icon: Database },
  { id: 'integrations', label: 'Integrations', icon: Puzzle },
];

export default function MobileSidebar({
  isOpen,
  onClose,
  currentTab,
  setCurrentTab,
  currentRole,
  onNewProjectClick,
}: MobileSidebarProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const renderTab = (tab: { id: string; label: string; icon: any; badge?: number }) => {
    const IconComponent = tab.icon;
    const isActive = currentTab === tab.id;

    return (
      <RippleButton
        key={tab.id}
        onClick={() => handleTabClick(tab.id)}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold tracking-wide cursor-pointer transition-all duration-200 hover:bg-slate-800/80 ${
          isActive
            ? 'bg-blue-600/10 text-blue-400 border-l-[3px] border-blue-400 pl-[9px]'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <IconComponent className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
        <span className="flex-1">{tab.label}</span>
        {tab.badge ? (
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-rose-500 text-white min-w-[20px] text-center leading-tight">
            {tab.badge}
          </span>
        ) : null}
      </RippleButton>
    );
  };

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 left-0 bottom-0 w-72 z-50 bg-slate-900 border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 pt-6 pb-4">
          <BrandLogo dark />
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-0.5 px-3 pb-4">
          {/* Main Section */}
          {mainTabs.map(renderTab)}

          {/* Operations - only for non-client */}
          {currentRole !== 'client' && (
            <>
              <div className="pt-3 pb-1">
                <div className="flex items-center gap-2 px-3">
                  <div className="flex-1 h-px bg-slate-800/60" />
                  <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">Operations</span>
                  <div className="flex-1 h-px bg-slate-800/60" />
                </div>
              </div>
              {operationsTabs.map(renderTab)}
            </>
          )}

          {/* Divider - Workspace */}
          <div className="pt-3 pb-1">
            <div className="flex items-center gap-2 px-3">
              <div className="flex-1 h-px bg-slate-800/60" />
              <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">Workspace</span>
              <div className="flex-1 h-px bg-slate-800/60" />
            </div>
          </div>
          {workspaceTabs.map(renderTab)}

          {/* Divider - Collaboration */}
          <div className="pt-3 pb-1">
            <div className="flex items-center gap-2 px-3">
              <div className="flex-1 h-px bg-slate-800/60" />
              <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">Collaboration</span>
              <div className="flex-1 h-px bg-slate-800/60" />
            </div>
          </div>
          {collaborationTabs.map(renderTab)}

          {/* Management - only for non-client */}
          {currentRole !== 'client' && (
            <>
              <div className="pt-3 pb-1">
                <div className="flex items-center gap-2 px-3">
                  <div className="flex-1 h-px bg-slate-800/60" />
                  <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">Management</span>
                  <div className="flex-1 h-px bg-slate-800/60" />
                </div>
              </div>
              {adminTabs.map(renderTab)}
            </>
          )}
        </nav>

        <div className="border-t border-slate-800/50 px-3 py-4 space-y-3">
          <button
            type="button"
            onClick={() => { onNewProjectClick(); onClose(); }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/10 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>

          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="text-[10px] font-bold tracking-widest text-slate-500 mb-1 uppercase">Perspective</div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="capitalize font-mono text-xs text-slate-300">{currentRole} Mode</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
