export interface TeamMember {
  name: string;
  avatarUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
  avatarUrl: string;
  title: string;
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
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  issuedDate: string;
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
