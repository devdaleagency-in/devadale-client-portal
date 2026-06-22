import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  MessageSquare,
  ScrollText,
  FileCheck,
  Receipt,
  Bell,
  User,
  LifeBuoy,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import RippleButton from './RippleButton';

interface ClientSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  unreadCount?: number;
}

export default function ClientSidebar({
  currentTab,
  setCurrentTab,
  unreadCount = 0,
}: ClientSidebarProps) {
  const mainTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'timeline', label: 'Roadmap', icon: Calendar },
    { id: 'deliverables', label: 'Deliverables', icon: FileCheck },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'agreements', label: 'Agreements', icon: ScrollText },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
  };

  const renderTab = (tab: { id: string; label: string; icon: any; badge?: number }) => {
    const IconComponent = tab.icon;
    const isActive = currentTab === tab.id;
    const showBadge = tab.badge !== undefined && tab.badge > 0;

    return (
      <RippleButton
        key={tab.id}
        onClick={() => handleTabClick(tab.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all duration-200 hover:bg-slate-800/80 active:scale-[0.98] touch-manipulation ${
          isActive
            ? 'bg-blue-600/10 text-blue-400 border-l-[3px] border-blue-400 pl-[9px]'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
        <span className="flex-1">{tab.label}</span>
        {showBadge && (
          <span className="px-1.5 py-0.5 text-[8px] font-bold rounded-full bg-rose-500 text-white min-w-[18px] text-center leading-tight">
            {tab.badge}
          </span>
        )}
      </RippleButton>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen fixed left-0 top-0 z-40 transition-colors">
      <div className="flex items-center gap-2 px-4 pt-6 pb-4 shrink-0">
        <BrandLogo dark />
      </div>

      <nav className="flex-1 overflow-y-auto space-y-0.5 px-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {mainTabs.map(renderTab)}
      </nav>

      <div className="border-t border-slate-800/50 px-3 py-3 space-y-2">
        <div className="bg-slate-800/30 rounded-lg p-2.5">
          <div className="text-[9px] font-bold tracking-widest text-slate-500 mb-0.5 uppercase">Access</div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="font-mono text-[11px] text-slate-300 leading-none">Client Portal</span>
          </div>
        </div>

        <RippleButton
          type="button"
          className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-semibold transition-all text-[11px] touch-manipulation"
          onClick={() => handleTabClick('support')}
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>Support Center</span>
        </RippleButton>
      </div>
    </aside>
  );
}
