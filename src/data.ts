import { Project, Agreement, ActivityFeed, Metrics, Deadline, Invoice, UploadedFile, ApprovalItem, TeamActivity } from './types';

export const teamAvatars = {
  alex: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA69ejop5YlOlFQkmduo9Nb23NN3GtBFzKBGcmp7XafPU-2t21daBVbrdsQCNyg5OnFYZxETND6_0ukorE0slIUH5ug2ePIvQBA20P6iuNM6vVPKC13BR6GIbDj4mZn3Myr7OpVqUUjkIghUIRRQKRYvZ5cpUxSDpRmlBZ0J2AFo4-LhqpGwdMLXkXR4Nv587xTW6bUvfa8AUw4_mkGEC_XrgWlWws4UHdE7IQ3x8M4_3rLIkbRubOOtQnIbVwz7rsS3II3xRRhVN0',
  sarah: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTGfS3cEGwSdGHDpZygaZHGvsFDG9hJ_mxMdfuCR9-6-rHjngZY3OJTrZVbAe1naOlohIYGfK15ABf9PYuOClXXBjsA6Oir3ftkGivisjWfUXralh-xgdoaaybgiL3dvTZhkmNEze9bcCAZeVBfArYUPUZNplkkgrowcQFi3u-mMPOzCWyL7JoBCxT3eulu3aBJ1zk_H6Xa4Cu7zVJe4Zagkpr2h7BVhiIIiqr8U2iNAIHQ8KIvpKdsCCuyRWsyZ0EhhxoiGvgcqc',
  mark: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDMag38qlOvSX8NYguJo_3_ze1fQvphN0vZnDOLzGl-VeJ3urdPN-3xDcB1JcehYgTDLTF13r5e2IjALe3FPd-5RkneIuhuk-O015hk6IeOeZrI3ui8nUDX3K3Qfpjhn42zlUM6DG4x6e1Ytk72OAGo82kp3dcnfeUlYPoSMH8l9M0TUwAbT_9CUw-NFhocXEn7VIC_FppZxmDanPsJ3jdj2Xo8_KcPzK7r2k5LZVkduQO5oRe0xlnq4XGAuuLPawC-TVIvqp0E60',
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Aether Fintech',
    stage: 'Design System',
    health: 'healthy',
    lastUpdated: '2 hours ago',
    client: 'Aether Fintech',
    iconName: 'Compass',
    progress: 75,
    nextMilestone: 'Tokenomics Design v2',
    nextMilestoneDate: 'Friday, Jun 5',
    team: [
      { name: 'Sarah Chen', avatarUrl: teamAvatars.sarah },
      { name: 'Mark Thompson', avatarUrl: teamAvatars.mark },
    ],
    description: 'Enterprise Design Token and System structure for secure financial ledgers.'
  },
  {
    id: 'proj-2',
    name: 'GreenHorizon ERP',
    stage: 'Frontend Dev',
    health: 'healthy',
    lastUpdated: '5 hours ago',
    client: 'GreenHorizon ERP',
    iconName: 'Leaf',
    progress: 40,
    nextMilestone: 'Dashboard integration',
    nextMilestoneDate: 'Wednesday, Jun 10',
    team: [
      { name: 'Admin User', avatarUrl: teamAvatars.alex },
      { name: 'Sarah Chen', avatarUrl: teamAvatars.sarah },
    ],
    description: 'Sustainable resource planning system using solar inventory optimization pipelines.'
  },
  {
    id: 'proj-3',
    name: 'Neural Labs AI',
    stage: 'Strategic Audit',
    health: 'warning',
    lastUpdated: '1 day ago',
    client: 'Neural Labs AI',
    iconName: 'Cpu',
    progress: 90,
    nextMilestone: 'Security audit signing',
    nextMilestoneDate: 'Thursday, Jun 4',
    team: [
      { name: 'Mark Thompson', avatarUrl: teamAvatars.mark },
    ],
    description: 'Deep network verification checks and API leakage reviews.'
  },
  {
    id: 'proj-4',
    name: 'SwiftShop E-com',
    stage: 'QA Testing',
    health: 'critical',
    lastUpdated: 'Just now',
    client: 'SwiftShop E-com',
    iconName: 'ShoppingCart',
    progress: 95,
    nextMilestone: 'Production launch validation',
    nextMilestoneDate: 'Tomorrow',
    team: [
      { name: 'Admin User', avatarUrl: teamAvatars.alex },
      { name: 'Sarah Chen', avatarUrl: teamAvatars.sarah },
      { name: 'Mark Thompson', avatarUrl: teamAvatars.mark },
    ],
    description: 'Hyper-optimized headless payment gateway with ultra-low latency checkout routing.'
  },
  {
    id: 'proj-focus',
    name: 'DevDale Agency',
    stage: 'UI/UX Design',
    health: 'healthy',
    lastUpdated: 'Yesterday',
    client: 'DevDale Agency',
    iconName: 'Palette',
    progress: 65,
    nextMilestone: 'V1 Prototype',
    nextMilestoneDate: 'Due Friday, Oct 27',
    team: [
      { name: 'Sarah Chen', avatarUrl: teamAvatars.sarah },
      { name: 'Mark Thompson', avatarUrl: teamAvatars.mark },
      { name: 'Admin User', avatarUrl: teamAvatars.alex },
    ],
    description: 'Comprehensive design system and operational brand visual guidelines for high-end workspace tools.'
  }
];

export const INITIAL_METRICS: Metrics = {
  activeProjects: 12,
  pendingApprovals: 4,
  teamProductivity: 92,
  monthlyRevenue: 142
};

export const INITIAL_AGREEMENTS: Agreement[] = [
  {
    id: 'agree-1',
    name: 'MSA - Aether Fintech',
    client: 'Aether Fintech',
    status: 'signed',
    date: '2 days ago',
  },
  {
    id: 'agree-2',
    name: 'SOW - GreenHorizon ERP',
    client: 'GreenHorizon ERP',
    status: 'pending',
    date: '5 hours ago',
  },
  {
    id: 'agree-3',
    name: 'NDA - Neural Labs AI',
    client: 'Neural Labs AI',
    status: 'draft',
    date: '1 day ago',
  }
];

export const INITIAL_ACTIVITY: ActivityFeed[] = [
  {
    id: 'act-1',
    message: "New feedback on 'Mobile Home'",
    timestamp: '2 hours ago',
    actor: 'Sarah Chen',
    type: 'feedback'
  },
  {
    id: 'act-2',
    message: 'Style Guide draft uploaded',
    timestamp: 'Yesterday',
    actor: 'Mark Thompson',
    type: 'upload'
  },
  {
    id: 'act-3',
    message: 'Milestone: Moodboards Approved',
    timestamp: '2 days ago',
    actor: 'Automation System',
    type: 'approval'
  }
];

export const INITIAL_MESSAGES = [
  {
    id: 'm-1',
    sender: 'agent',
    text: 'Hello Alex! I am your DevDale Workspace Agent. How can I help you coordinate with Neural Labs AI or draft the next Agreement documents today?',
    timestamp: 'Just now'
  }
];

export const INITIAL_DEADLINES: Deadline[] = [
  { id: 'dl-1', task: 'V1 Prototype Review', project: 'DevDale Agency', dueDate: '2024-10-27', priority: 'high', status: 'today', assignee: 'Alex' },
  { id: 'dl-2', task: 'Brand Guidelines Final Sign-off', project: 'DevDale Agency', dueDate: '2024-10-30', priority: 'medium', status: 'this-week', assignee: 'Sarah Chen' },
  { id: 'dl-3', task: 'Tokenomics Design v2', project: 'Aether Fintech', dueDate: '2025-06-05', priority: 'high', status: 'this-week', assignee: 'Mark Thompson' },
  { id: 'dl-4', task: 'Dashboard Integration Review', project: 'GreenHorizon ERP', dueDate: '2025-06-10', priority: 'medium', status: 'upcoming', assignee: 'Sarah Chen' },
  { id: 'dl-5', task: 'Production Launch Validation', project: 'SwiftShop E-com', dueDate: '2024-10-25', priority: 'high', status: 'overdue', assignee: 'Admin User' },
  { id: 'dl-6', task: 'Security Audit Signing', project: 'Neural Labs AI', dueDate: '2024-06-04', priority: 'high', status: 'overdue', assignee: 'Mark Thompson' },
];

export const INITIAL_INVOICES: Invoice[] = [
  { id: 'inv-1', number: 'INV-2024-001', client: 'Aether Fintech', amount: 24000, currency: 'USD', status: 'paid', dueDate: '2024-10-15', issuedDate: '2024-09-15' },
  { id: 'inv-2', number: 'INV-2024-002', client: 'GreenHorizon ERP', amount: 18500, currency: 'USD', status: 'pending', dueDate: '2024-11-01', issuedDate: '2024-10-01' },
  { id: 'inv-3', number: 'INV-2024-003', client: 'Neural Labs AI', amount: 32000, currency: 'USD', status: 'overdue', dueDate: '2024-10-10', issuedDate: '2024-09-10' },
  { id: 'inv-4', number: 'INV-2024-004', client: 'DevDale Agency', amount: 8500, currency: 'USD', status: 'pending', dueDate: '2024-11-15', issuedDate: '2024-10-15' },
];

export const INITIAL_UPLOADS: UploadedFile[] = [
  { id: 'up-1', name: 'Brand_Guidelines_v3.pdf', type: 'pdf', size: '2.4 MB', uploadedBy: 'Sarah Chen', uploadedAt: 'Yesterday', project: 'DevDale Agency' },
  { id: 'up-2', name: 'Desktop_Wireframes.fig', type: 'figma', size: '18.2 MB', uploadedBy: 'Mark Thompson', uploadedAt: '2 days ago', project: 'DevDale Agency' },
  { id: 'up-3', name: 'Assets_Package.zip', type: 'zip', size: '45 MB', uploadedBy: 'Sarah Chen', uploadedAt: '3 days ago', project: 'DevDale Agency' },
  { id: 'up-4', name: 'Dashboard_Mockup_v2.png', type: 'image', size: '3.1 MB', uploadedBy: 'Mark Thompson', uploadedAt: '5 days ago', project: 'GreenHorizon ERP' },
  { id: 'up-5', name: 'API_Documentation.docx', type: 'doc', size: '1.8 MB', uploadedBy: 'Admin User', uploadedAt: '1 week ago', project: 'Neural Labs AI' },
];

export const INITIAL_APPROVALS: ApprovalItem[] = [
  { id: 'ap-1', title: 'Homepage Hero Section Redesign', type: 'design', status: 'pending', submittedBy: 'Mark Thompson', submittedAt: '2 hours ago', description: 'Updated hero section with new brand gradients and typography system.' },
  { id: 'ap-2', title: 'Brand Guidelines v3 Final Draft', type: 'content', status: 'pending', submittedBy: 'Sarah Chen', submittedAt: 'Yesterday', description: 'Final version including logo usage, color palette, and typography specs.' },
  { id: 'ap-3', title: 'MSA - SwiftShop E-com Launch', type: 'agreement', status: 'pending', submittedBy: 'Admin User', submittedAt: '3 hours ago', description: 'Master Service Agreement for SwiftShop E-com platform launch.' },
  { id: 'ap-4', title: 'UI Design System Milestone', type: 'milestone', status: 'approved', submittedBy: 'Sarah Chen', submittedAt: '2 days ago', description: 'All UI components finalized and documented in design system.' },
];

export const INITIAL_TEAM_ACTIVITY: TeamActivity[] = [
  { id: 'ta-1', user: { name: 'Sarah Chen', avatarUrl: teamAvatars.sarah }, action: 'commented on', target: 'Homepage Hero Section', timestamp: '15 min ago', type: 'comment' },
  { id: 'ta-2', user: { name: 'Mark Thompson', avatarUrl: teamAvatars.mark }, action: 'uploaded', target: 'Wireframes_v2.fig', timestamp: '42 min ago', type: 'upload' },
  { id: 'ta-3', user: { name: 'Admin User', avatarUrl: teamAvatars.alex }, action: 'approved', target: 'Brand Guidelines v3', timestamp: '1 hour ago', type: 'approval' },
  { id: 'ta-4', user: { name: 'Sarah Chen', avatarUrl: teamAvatars.sarah }, action: 'updated', target: 'UI Design System', timestamp: '2 hours ago', type: 'update' },
  { id: 'ta-5', user: { name: 'Mark Thompson', avatarUrl: teamAvatars.mark }, action: 'created task', target: 'Mobile Responsive Check', timestamp: '3 hours ago', type: 'task' },
  { id: 'ta-6', user: { name: 'Admin User', avatarUrl: teamAvatars.alex }, action: 'commented on', target: 'API Documentation', timestamp: '5 hours ago', type: 'comment' },
];

