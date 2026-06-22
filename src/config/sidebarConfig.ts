import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Settings,
  Palette,
  Users,
  Receipt,
  Bell,
  ClipboardList,
  UserPlus,
  BarChart3,
  CreditCard,
  Database,
  Puzzle,
  FileCheck,
  User,
  Map,
  LifeBuoy
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  route: string;
  allowedRoles: string[];
  badge?: number;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

export const adminSidebarConfig: SidebarSection[] = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/admin', allowedRoles: ['admin', 'super_admin', 'team_member'] },
      { id: 'projects', label: 'Projects', icon: Briefcase, route: '/admin/projects', allowedRoles: ['admin', 'super_admin', 'team_member'] },
      { id: 'deliverables', label: 'Deliverables', icon: FileCheck, route: '/admin/deliverables', allowedRoles: ['admin', 'super_admin', 'team_member'] },
      { id: 'messages', label: 'Messages', icon: MessageSquare, route: '/admin/messages', allowedRoles: ['admin', 'super_admin', 'team_member'] },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'clients', label: 'Clients', icon: UserPlus, route: '/admin/clients', allowedRoles: ['admin', 'super_admin'] },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, route: '/admin/analytics', allowedRoles: ['admin', 'super_admin'] },
      { id: 'billing', label: 'Billing', icon: CreditCard, route: '/admin/billing', allowedRoles: ['admin', 'super_admin'] },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { id: 'invoices', label: 'Invoices', icon: Receipt, route: '/admin/invoices', allowedRoles: ['admin', 'super_admin'] },
      { id: 'notifications', label: 'Notifications', icon: Bell, route: '/admin/notifications', badge: 3, allowedRoles: ['admin', 'super_admin', 'team_member'] },
      { id: 'support', label: 'Support Center', icon: LifeBuoy, route: '/admin/support', allowedRoles: ['admin', 'super_admin', 'team_member'] },
    ],
  },
  {
    title: 'Collaboration',
    items: [
      { id: 'team', label: 'Team Access', icon: Users, route: '/admin/team', allowedRoles: ['admin', 'super_admin'] },
      { id: 'meetings', label: 'Meeting Notes', icon: ClipboardList, route: '/admin/meetings', allowedRoles: ['admin', 'super_admin', 'team_member'] },
    ],
  },
  {
    title: 'Management',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings, route: '/admin/settings', allowedRoles: ['admin', 'super_admin'] },
      { id: 'branding', label: 'Portal Config', icon: Palette, route: '/admin/branding', allowedRoles: ['admin', 'super_admin'] },
      { id: 'system', label: 'System', icon: Database, route: '/admin/system', allowedRoles: ['admin', 'super_admin'] },
      { id: 'integrations', label: 'Integrations', icon: Puzzle, route: '/admin/integrations', allowedRoles: ['admin', 'super_admin'] },
    ],
  },
];

export const clientSidebarConfig: SidebarSection[] = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard', allowedRoles: ['client'] },
      { id: 'profile', label: 'My Profile', icon: User, route: '/profile', allowedRoles: ['client'] },
      { id: 'roadmap', label: 'Roadmap', icon: Map, route: '/roadmap', allowedRoles: ['client'] },
      { id: 'messages', label: 'Messages', icon: MessageSquare, route: '/messages', allowedRoles: ['client'] },
    ],
  },
  {
    title: 'Documentation',
    items: [
      { id: 'agreements', label: 'Agreements', icon: FileCheck, route: '/agreements', allowedRoles: ['client'] },
      { id: 'deliverables', label: 'Deliverables', icon: FileCheck, route: '/deliverables', allowedRoles: ['client'] },
      { id: 'invoices', label: 'Invoices', icon: Receipt, route: '/invoices', allowedRoles: ['client'] },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'notifications', label: 'Notifications', icon: Bell, route: '/notifications', badge: 1, allowedRoles: ['client'] },
      { id: 'support', label: 'Support Center', icon: LifeBuoy, route: '/support', allowedRoles: ['client'] },
    ],
  },
];
