import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Settings,
  Palette,
  Plus,
  User,
  HardDrive,
  Crown,
  Users,
  MessageCircle,
  LifeBuoy,
  HelpCircle,
  ChevronRight,
  Receipt,
  Bell,
  ClipboardList,
  Shield,
  UserPlus,
  Database,
  BarChart3,
  CreditCard,
  Puzzle,
  FileCheck,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import RippleButton from './RippleButton';

interface AdminSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onNewProjectClick: () => void;
}

const teamMembers = [
  { initials: 'JD', gradient: 'from-blue-400 to-blue-600' },
  { initials: 'SC', gradient: 'from-emerald-400 to-emerald-600' },
  { initials: 'AK', gradient: 'from-purple-400 to-purple-600' },
  { initials: 'MR', gradient: 'from-rose-400 to-rose-600' },
  { initials: 'TW', gradient: 'from-amber-400 to-amber-600' },
];

export default function AdminSidebar({
  currentTab,
  setCurrentTab,
  onNewProjectClick,
}: AdminSidebarProps) {
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

  const managementTabs = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'branding', label: 'Portal Config', icon: Palette },
    { id: 'system', label: 'System', icon: Database },
    { id: 'integrations', label: 'Integrations', icon: Puzzle },
  ];

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
  };

  const renderTab = (tab: { id: string; label: string; icon: any; badge?: number }) => {
    const IconComponent = tab.icon;
    const isActive = currentTab === tab.id;

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
        {tab.badge ? (
          <span className="px-1.5 py-0.5 text-[8px] font-bold rounded-full bg-rose-500 text-white min-w-[18px] text-center leading-tight">
            {tab.badge}
          </span>
        ) : null}
      </RippleButton>
    );
  };

  const renderSection = (title: string, tabs: any[]) => (
    <>
      <div className="pt-4 pb-1">
        <div className="flex items-center gap-2 px-3">
          <div className="flex-1 h-px bg-slate-800/60" />
          <span className="text-[9px] font-bold tracking-widest text-slate-600 uppercase">{title}</span>
          <div className="flex-1 h-px bg-slate-800/60" />
        </div>
      </div>
      {tabs.map(renderTab)}
    </>
  );

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen fixed left-0 top-0 z-40 transition-colors">
      <div className="flex items-center gap-2 px-4 pt-6 pb-4 shrink-0">
        <BrandLogo dark />
      </div>

      <nav className="flex-1 overflow-y-auto space-y-0.5 px-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {mainTabs.map(renderTab)}
        {renderSection('Operations', operationsTabs)}
        {renderSection('Workspace', workspaceTabs)}
        {renderSection('Collaboration', collaborationTabs)}
        {renderSection('Management', managementTabs)}
      </nav>

      <div className="border-t border-slate-800/50 space-y-2.5 px-3 py-3 overflow-y-auto shrink-0 max-h-[520px]">
        <div className="group bg-slate-800/40 hover:bg-slate-800/60 rounded-xl p-3 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">78 / 100 GB</span>
          </div>
          <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
            <div className="h-full w-[78%] bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500 group-hover:brightness-110" />
          </div>
          <div className="flex justify-end mt-1">
            <span className="text-[9px] font-mono text-slate-500">78% used</span>
          </div>
        </div>

        <div className="group bg-slate-800/40 hover:bg-slate-800/60 rounded-xl p-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan</span>
            </div>
            <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Pro
            </span>
          </div>
          <button className="mt-2 w-full py-1.5 bg-slate-700/60 hover:bg-slate-600/80 text-slate-300 hover:text-white text-[10px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1 group/upgrade">
            <span>Upgrade Plan</span>
            <ChevronRight className="w-3 h-3 group-hover/upgrade:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="group bg-slate-800/40 hover:bg-slate-800/60 rounded-xl p-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Online</span>
            </div>
            <span className="text-[10px] text-slate-400">{teamMembers.length} members</span>
          </div>
          <div className="flex items-center mt-2">
            <div className="flex -space-x-1.5">
              {teamMembers.slice(0, 3).map((member, i) => (
                <div
                  key={member.initials}
                  className={`relative w-6 h-6 rounded-full bg-gradient-to-br ${member.gradient} border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-white`}
                >
                  {member.initials}
                </div>
              ))}
              <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-400">
                +{teamMembers.length - 3}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {[
            { value: '12', label: 'Projects', color: 'text-blue-400' },
            { value: '48', label: 'Completed', color: 'text-emerald-400' },
            { value: '$8.2k', label: 'Revenue', color: 'text-amber-400' },
          ].map((stat) => (
            <div key={stat.label} className="group bg-slate-800/40 hover:bg-slate-800/60 rounded-lg p-2 text-center transition-colors">
              <div className={`text-xs font-bold ${stat.color} group-hover:scale-110 transition-transform`}>{stat.value}</div>
              <div className="text-[8px] text-slate-500 mt-0.5 tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {[
            { icon: MessageCircle, label: 'Chat', color: 'hover:text-blue-400' },
            { icon: HelpCircle, label: 'Help', color: 'hover:text-emerald-400' },
            { icon: LifeBuoy, label: 'Support', color: 'hover:text-amber-400' },
          ].map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              type="button"
              className={`flex items-center justify-center gap-1 flex-1 py-1.5 bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 ${color} rounded-lg text-[10px] font-semibold transition-all`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="border-t border-slate-800/50 pt-2 space-y-2">
          <RippleButton
            type="button"
            onClick={onNewProjectClick}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/10 text-[11px] touch-manipulation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </RippleButton>
        </div>
      </div>
    </aside>
  );
}
