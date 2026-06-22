export interface TeamMember {
  name: string;
  avatarUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'client' | 'team_member' | 'onboarding';
  avatarUrl: string;
  title: string;
}

export interface Milestone {
  id: string;
  label: string;
  date: string;
  status: 'completed' | 'active' | 'planned';
  tone: string;
}

export interface Project {
  id: string;
  name: string;
  stage: string;
  health: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
  client: string;
  iconName: string;
  progress: number;
  nextMilestone: string;
  nextMilestoneDate: string;
  team: TeamMember[];
  description: string;
  milestones?: Milestone[];
}

export interface Agreement {
  id: string;
  name: string;
  client: string;
  status: 'signed' | 'pending' | 'draft';
  date: string;
}

export interface Metrics {
  activeProjects: number;
  pendingApprovals: number;
  teamProductivity: number;
  monthlyRevenue: number;
  trends?: {
    activeProjects?: { value: string; direction: 'up' | 'down' };
    teamProductivity?: { value: string; direction: 'up' | 'down' };
    monthlyRevenue?: { value: string; direction: 'up' | 'down' };
  };
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  iconName: string;
  status: 'Connected' | 'Needs auth' | 'Ready';
  workspaceId: string;
  lastSyncedAt?: string;
}

export interface Subscription {
  id: string;
  workspaceId: string;
  planName: string;
  teamSeatsCount: number;
  agencyMembersCount: number;
  contractorsCount: number;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  renewalDate?: string;
}

export interface ActivityFeed {
  id: string;
  message: string;
  timestamp: string;
  actor: string;
  type: 'feedback' | 'upload' | 'approval';
}

export interface Deliverable {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'code' | 'other';
  url: string; // path to asset
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
}

export interface UploadedAsset {
  name: string;
  size: string;
  status: 'uploaded' | 'processing' | 'failed';
  tag?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface OnboardingLinkRequest {
  clientName: string;
  organization: string;
  phone: string;
  email: string;
  expiresAt: string;
}

export interface OnboardingLinkResponse {
  id: string;
  token: string;
  clientName: string;
  organization: string;
  phone: string;
  email: string;
  expiresAt: string;
  createdAt: string;
  status: 'active' | 'expired' | 'used';
}

export interface Deadline {
  id: string;
  task: string;
  project: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'overdue' | 'today' | 'this-week' | 'upcoming';
  assignee: string;
}

export interface Invoice {
  id: string;
  number: string;
  client: string;
  clientId?: string;
  amount: number;
  tax?: number;
  total?: number;
  currency: string;
  status: string;
  dueDate: string;
  issuedDate: string;
  notes?: string;
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  createdAt?: string;
}

export function toClientStatus(status: string): string {
  const map: Record<string, string> = {
    draft: 'Preparing',
    sent: 'Received',
    viewed: 'Under Review',
    paid: 'Paid',
    partially_paid: 'Partially Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
  };
  return map[status] || status;
}

export function getStatusColor(status: string, clientView = true): string {
  const s = clientView ? toClientStatus(status) : status;
  const colors: Record<string, string> = {
    Preparing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    Received: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    'Under Review': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    Paid: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    'Partially Paid': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    Overdue: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
    Cancelled: 'bg-slate-100 dark:bg-slate-800 text-slate-400',
    draft: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    sent: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    viewed: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    paid: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    partially_paid: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    overdue: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
    cancelled: 'bg-slate-100 dark:bg-slate-800 text-slate-400',
  };
  return colors[s] || 'bg-slate-100 dark:bg-slate-800 text-slate-500';
}

export interface UploadedFile {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'zip' | 'doc' | 'figma' | 'other';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  project: string;
  url?: string;
}

export interface ApprovalItem {
  id: string;
  title: string;
  type: 'design' | 'content' | 'agreement' | 'milestone';
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedAt: string;
  description: string;
}

export interface TeamActivity {
  id: string;
  user: { name: string; avatarUrl: string };
  action: string;
  target: string;
  timestamp: string;
  type: 'comment' | 'upload' | 'approval' | 'update' | 'task';
}

export interface OnboardingData {
  companyName: string;
  industry: string;
  /** Required when industry is "Others" */
  industryOther: string;
  websiteUrl: string;
  description: string;
  brandPersonality: string;
  targetAudience: string;
  competitors: string;
  preferredColors: string;
  designInspiration: string;
  featureRequirements: string;
  functionalRequirements: string;
  technicalRequirements: string;
  referenceWebsites: string;
  socialLinks: string;
  additionalNotes: string;
  brandAssets: UploadedAsset[];
}

export type NotificationCategory =
  | 'approval'
  | 'message'
  | 'upload'
  | 'billing'
  | 'task'
  | 'system'
  | 'activity';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  actor?: { name: string; avatarUrl: string };
  target?: string;
  actionType?: 'approve' | 'reject' | 'preview' | 'download' | 'view';
  metadata?: Record<string, string>;
}
