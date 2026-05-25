import fs from 'fs';
import path from 'path';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

interface OnboardingLink {
  id: string;
  token: string;
  clientName: string;
  organization: string;
  phone: string;
  email: string;
  expiresAt: string;
  createdAt: string;
  usedAt?: string;
  status: 'active' | 'expired' | 'used';
}

interface DbSchema {
  projects: any[];
  agreements: any[];
  activity: any[];
  metrics: { activeProjects: number; pendingApprovals: number; teamProductivity: number; monthlyRevenue: number };
  msaStatus: 'signed' | 'pending' | 'draft';
  uploadedFiles: { name: string; size: string; tag: string; path: string; uploadedAt: string }[];
  users: { id: string; name: string; email: string; password: string; role: 'admin' | 'client'; avatarUrl: string; title: string }[];
  sessions: { token: string; userId: string; role: 'admin' | 'client'; createdAt: string }[];
  messages: { id: string; sender: 'user' | 'agent'; text: string; timestamp: string }[];
  onboardingLinks: OnboardingLink[];
}

const defaultDb: DbSchema = {
  projects: [],
  agreements: [],
  activity: [],
  metrics: { activeProjects: 0, pendingApprovals: 0, teamProductivity: 92, monthlyRevenue: 142 },
  msaStatus: 'pending',
  uploadedFiles: [],
  onboardingLinks: [],
  users: [
    {
      id: 'user-1',
      name: 'Admin User',
      email: 'admin@devdale.com',
      password: 'admin123',
      role: 'admin',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTGfS3cEGwSdGHDpZygaZHGvsFDG9hJ_mxMdfuCR9-6-rHjngZY3OJTrZVbAe1naOlohIYGfK15ABf9PYuOClXXBjsA6Oir3ftkGivisjWfUXralh-xgdoaaybgiL3dvTZhkmNEze9bcCAZeVBfArYUPUZNplkkgrowcQFi3u-mMPOzCWyL7JoBCxT3eulu3aBJ1zk_H6Xa4Cu7zVJe4Zagkpr2h7BVhiIIiqr8U2iNAIHQ8KIvpKdsCCuyRWsyZ0EhhxoiGvgcqc',
      title: 'Corporate Director',
    },
    {
      id: 'user-2',
      name: 'Sarah Chen',
      email: 'sarah@devdale.com',
      password: 'client456',
      role: 'client',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTGfS3cEGwSdGHDpZygaZHGvsFDG9hJ_mxMdfuCR9-6-rHjngZY3OJTrZVbAe1naOlohIYGfK15ABf9PYuOClXXBjsA6Oir3ftkGivisjWfUXralh-xgdoaaybgiL3dvTZhkmNEze9bcCAZeVBfArYUPUZNplkkgrowcQFi3u-mMPOzCWyL7JoBCxT3eulu3aBJ1zk_H6Xa4Cu7zVJe4Zagkpr2h7BVhiIIiqr8U2iNAIHQ8KIvpKdsCCuyRWsyZ0EhhxoiGvgcqc',
      title: 'Engineering & PM Director',
    },
  ],
  sessions: [],
  messages: [],
};

function readDb(): DbSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const seed = createSeedData();
      writeDb(seed);
      return seed;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    // Merge users so new defaults aren't lost when db.json already exists
    const existingIds = new Set((data.users || []).map((u: any) => u.id));
    const mergedUsers = [
      ...(data.users || []),
      ...defaultDb.users.filter((u) => !existingIds.has(u.id)),
    ];
    return { ...defaultDb, ...data, users: mergedUsers };
  } catch {
    const seed = createSeedData();
    writeDb(seed);
    return seed;
  }
}

function createSeedData(): DbSchema {
  const initialProjects = [
    {
      id: 'proj-1', name: 'Aether Fintech', stage: 'Design System', health: 'healthy',
      lastUpdated: '2 hours ago', client: 'Aether Fintech', iconName: 'Compass',
      progress: 75, nextMilestone: 'Tokenomics Design v2', nextMilestoneDate: 'Friday, Jun 5',
      team: [{ name: 'Mark Thompson', avatarUrl: '' }],
      description: 'Enterprise Design Token and System structure for secure financial ledgers.',
    },
    {
      id: 'proj-2', name: 'GreenHorizon ERP', stage: 'Frontend Dev', health: 'healthy',
      lastUpdated: '5 hours ago', client: 'GreenHorizon ERP', iconName: 'Leaf',
      progress: 40, nextMilestone: 'Dashboard integration', nextMilestoneDate: 'Wednesday, Jun 10',
      team: [{ name: 'Admin User', avatarUrl: '' }],
      description: 'Sustainable resource planning system using solar inventory optimization pipelines.',
    },
    {
      id: 'proj-3', name: 'Neural Labs AI', stage: 'Strategic Audit', health: 'warning',
      lastUpdated: '1 day ago', client: 'Neural Labs AI', iconName: 'Cpu',
      progress: 90, nextMilestone: 'Security audit signing', nextMilestoneDate: 'Thursday, Jun 4',
      team: [{ name: 'Mark Thompson', avatarUrl: '' }],
      description: 'Deep network verification checks and API leakage reviews.',
    },
    {
      id: 'proj-4', name: 'SwiftShop E-com', stage: 'QA Testing', health: 'critical',
      lastUpdated: 'Just now', client: 'SwiftShop E-com', iconName: 'ShoppingCart',
      progress: 95, nextMilestone: 'Production launch validation', nextMilestoneDate: 'Tomorrow',
      team: [{ name: 'Admin User', avatarUrl: '' }, { name: 'Mark Thompson', avatarUrl: '' }],
      description: 'Hyper-optimized headless payment gateway with ultra-low latency checkout routing.',
    },
    {
      id: 'proj-focus', name: 'DevDale Agency', stage: 'UI/UX Design', health: 'healthy',
      lastUpdated: 'Yesterday', client: 'DevDale Agency', iconName: 'Palette',
      progress: 65, nextMilestone: 'V1 Prototype', nextMilestoneDate: 'Due Friday, Oct 27',
      team: [{ name: 'Mark Thompson', avatarUrl: '' }, { name: 'Admin User', avatarUrl: '' }],
      description: 'Comprehensive design system and operational brand visual guidelines for high-end workspace tools.',
    },
  ];

  const initialAgreements = [
    { id: 'agree-1', name: 'MSA - Aether Fintech', client: 'Aether Fintech', status: 'signed' as const, date: '2 days ago' },
    { id: 'agree-2', name: 'SOW - GreenHorizon ERP', client: 'GreenHorizon ERP', status: 'pending' as const, date: '5 hours ago' },
    { id: 'agree-3', name: 'NDA - Neural Labs AI', client: 'Neural Labs AI', status: 'draft' as const, date: '1 day ago' },
  ];

  const initialActivity = [
    { id: 'act-1', message: "New feedback on 'Mobile Home'", timestamp: '2 hours ago', actor: 'Mark Thompson', type: 'feedback' as const },
    { id: 'act-2', message: 'Style Guide draft uploaded', timestamp: 'Yesterday', actor: 'Mark Thompson', type: 'upload' as const },
    { id: 'act-3', message: 'Milestone: Moodboards Approved', timestamp: '2 days ago', actor: 'Automation System', type: 'approval' as const },
  ];

  return {
    ...defaultDb,
    projects: initialProjects,
    agreements: initialAgreements,
    activity: initialActivity,
    metrics: { activeProjects: 4, pendingApprovals: 1, teamProductivity: 92, monthlyRevenue: 142 },
  };
}

function writeDb(data: DbSchema): void {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function getProjects() {
  return readDb().projects;
}

export function addProject(project: any) {
  const db = readDb();
  db.projects.unshift(project);
  db.metrics.activeProjects = db.projects.filter((p: any) => p.id !== 'proj-focus').length;
  db.activity.unshift({
    id: `act-${Date.now()}`,
    message: `Allocated new project pipeline: ${project.name}`,
    timestamp: 'Just now',
    actor: 'Admin Console',
    type: 'approval',
  });
  writeDb(db);
  return project;
}

export function getAgreements() {
  return readDb().agreements;
}

export function addAgreement(agreement: any) {
  const db = readDb();
  db.agreements.unshift(agreement);
  db.metrics.pendingApprovals = db.agreements.filter((a: any) => a.status === 'pending').length;
  writeDb(db);
  return agreement;
}

export function signAgreement() {
  const db = readDb();
  db.msaStatus = 'signed';
  db.agreements = db.agreements.map((a: any) =>
    a.id === 'agree-2' ? { ...a, status: 'signed' as const, date: 'Just signed' } : a
  );
  db.metrics.pendingApprovals = Math.max(0, db.metrics.pendingApprovals - 1);
  db.activity.unshift({
    id: `act-${Date.now()}`,
    message: 'Master Service Agreement signed off',
    timestamp: 'Just now',
    actor: 'Admin User',
    type: 'approval',
  });
  writeDb(db);
  return { msaStatus: db.msaStatus, agreements: db.agreements, metrics: db.metrics, activity: db.activity };
}

export function getActivity() {
  return readDb().activity;
}

export function getMetrics() {
  const db = readDb();
  return {
    ...db.metrics,
    activeProjects: db.projects.filter((p: any) => p.id !== 'proj-focus').length,
    pendingApprovals: db.agreements.filter((a: any) => a.status === 'pending').length,
  };
}

export function getMsaStatus() {
  return readDb().msaStatus;
}

export function getUsers() {
  return readDb().users;
}

export function getUserById(id: string) {
  return readDb().users.find((u) => u.id === id) || null;
}

export function createSession(userId: string, role: 'admin' | 'client') {
  const db = readDb();
  const token = `tok-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const session = { token, userId, role, createdAt: new Date().toISOString() };
  db.sessions.push(session);
  writeDb(db);
  return session;
}

export function getSession(token: string) {
  return readDb().sessions.find((s) => s.token === token) || null;
}

export function getMessages() {
  return readDb().messages;
}

export function addMessage(msg: { sender: 'user' | 'agent'; text: string }) {
  const db = readDb();
  const message = { id: `msg-${Date.now()}`, ...msg, timestamp: new Date().toISOString() };
  db.messages.push(message);
  writeDb(db);
  return message;
}

export function getUploadedFiles() {
  return readDb().uploadedFiles;
}

export function addUploadedFile(file: { name: string; size: string; tag: string; path: string }) {
  const db = readDb();
  const entry = { ...file, uploadedAt: new Date().toISOString() };
  db.uploadedFiles.push(entry);
  writeDb(db);
  return entry;
}

export function createOnboardingLink(data: {
  clientName: string;
  organization: string;
  phone: string;
  email: string;
  expiresAt: string;
}) {
  const db = readDb();
  const token = `onb-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const link: OnboardingLink = {
    id: `link-${Date.now()}`,
    token,
    ...data,
    createdAt: new Date().toISOString(),
    status: 'active',
  };
  db.onboardingLinks.push(link);
  writeDb(db);
  return link;
}

export function getOnboardingLinkByToken(token: string) {
  return readDb().onboardingLinks.find((l) => l.token === token) || null;
}

export function consumeOnboardingLink(token: string) {
  const db = readDb();
  const link = db.onboardingLinks.find((l) => l.token === token);
  if (!link) return null;
  link.status = 'used';
  link.usedAt = new Date().toISOString();
  writeDb(db);
  return link;
}

export function updateUserAvatar(userId: string, avatarPath: string) {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  user.avatarUrl = avatarPath;
  writeDb(db);
  return user;
}

export function removeUserAvatar(userId: string) {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  user.avatarUrl = '';
  writeDb(db);
  return user;
}

export function resetDb() {
  const db = createSeedData();
  writeDb(db);
  return db;
}
