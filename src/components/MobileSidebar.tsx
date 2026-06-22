import { useEffect, useRef } from 'react';
import { X, LayoutDashboard, Briefcase, Calendar, MessageSquare, ScrollText, FileCheck, Receipt, Bell, User, LifeBuoy, Plus } from 'lucide-react';
import BrandLogo from './BrandLogo';
import RippleButton from './RippleButton';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: 'admin' | 'client' | 'team_member' | 'onboarding';
  onNewProjectClick: () => void;
}

const mainTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'timeline', label: 'Roadmap', icon: Calendar },
  { id: 'deliverables', label: 'Deliverables', icon: FileCheck },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'agreements', label: 'Agreements', icon: ScrollText },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'My Profile', icon: User },
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

  const renderTab = (tab: { id: string; label: string; icon: any }) => {
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
          {mainTabs.map(renderTab)}
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

          <RippleButton
            onClick={() => handleTabClick('support')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-semibold transition-all text-sm"
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Support Center</span>
          </RippleButton>

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
