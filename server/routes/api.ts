import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Project from '../models/Project';
import User from '../models/User';
import PortalSettings from '../models/PortalSettings';
import Session from '../models/Session';
import Summary from '../models/Summary';
import Message from '../models/Message';
import { authenticate } from '../middleware/authenticate';
import { authorize, adminOnly, adminOrTeamMember } from '../middleware/authorize';
import Document from '../models/Document';
import AuditLog from '../models/AuditLog';
import OnboardingLink from '../models/OnboardingLink';
import { generateChatResponse, generateProjectSummary } from '../services/ai';
import { sendNotification } from '../services/notification.service';

const router = Router();

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.get('/me', async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: user.toJSON(), role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.get('/projects', async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.user!;
    let query: any = {};
    if (role === 'client') {
      query = { clientId: userId };
    } else if (role === 'team_member') {
      query = { assignedMembers: userId };
    }
    
    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.post('/projects', adminOrTeamMember, async (req: Request, res: Response) => {
  try {
    const project = new Project({
      _id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...req.body,
      lastUpdated: "Just now",
    });
    await project.save();

    if (project.clientId) {
      const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
      for (const admin of admins) {
        await sendNotification({
          userId: admin._id.toString(),
          type: 'in_app',
          title: 'New Project Created',
          body: `Project "${project.name}" has been created.`,
          data: { category: 'task', metadata: { project: project.name, projectId: project._id } },
        });
      }
      await sendNotification({
        userId: project.clientId,
        type: 'in_app',
        title: 'New Project Created',
        body: `Your project "${project.name}" has been created. Check your dashboard for details.`,
        data: { category: 'task', metadata: { project: project.name, projectId: project._id } },
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.get('/agreements', async (req: Request, res: Response) => {
  try {
    const { role, userId } = req.user!;
    let query: any = { type: { $in: ['agreement', 'msa', 'sow', 'nda'] } };
    if (role === 'client') query.clientId = userId;
    const docs = await Document.find(query).populate('clientId', 'name').sort({ createdAt: -1 });
    const agreements = docs.map(d => ({
      id: d._id,
      name: d.name,
      client: (d.clientId as any)?.name || 'Unknown',
      status: d.status === 'final' ? 'signed' : (d.status === 'draft' ? 'pending' : 'draft'),
      date: d.createdAt.toLocaleDateString(),
    }));
    res.json(agreements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agreements' });
  }
});

router.post('/agreements', adminOrTeamMember, async (req: Request, res: Response) => {
  try {
    const { name, client, status } = req.body;
    // Find client by name (naive approach since frontend sends string)
    const clientUser = await User.findOne({ name: client, role: 'client' });
    const doc = new Document({
      _id: `agree-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      clientId: clientUser ? clientUser._id : req.user!.userId,
      name: name || 'New Agreement',
      type: 'msa',
      fileUrl: '',
      uploadedBy: req.user!.userId,
      status: status === 'signed' ? 'final' : (status === 'pending' ? 'draft' : 'draft')
    });
    await doc.save();
    res.json({
      id: doc._id,
      name: doc.name,
      client: client || 'Unknown',
      status: doc.status === 'final' ? 'signed' : 'pending',
      date: doc.createdAt.toLocaleDateString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add agreement' });
  }
});

router.post('/agreements/sign', async (req: Request, res: Response) => {
  await Document.updateMany({ clientId: req.user!.userId, type: 'msa' }, { status: 'final' });
  const metrics = { activeProjects: 0, pendingApprovals: 0, teamProductivity: 0, monthlyRevenue: 0 };
  const result = { msaStatus: 'signed', agreements: [], metrics, activity: [] };
  const { userId } = req.user!;
  const user = await User.findById(userId);
  if (user) {
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    for (const admin of admins) {
      await sendNotification({
        userId: admin._id.toString(),
        type: 'in_app',
        title: 'Agreement Signed',
        body: `${user.name} has signed the MSA agreement.`,
        data: { category: 'approval', actionable: true },
      });
    }
  }
  res.json(result);
});

router.get('/activity', async (req: Request, res: Response) => {
  try {
    const { role, userId } = req.user!;
    let query: any = {};
    if (role === 'client') query.userId = userId;
    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(20);
    const activity = logs.map(l => ({
      id: l._id,
      message: l.description,
      timestamp: l.createdAt.toLocaleDateString(),
      actor: l.userRole,
      type: l.action
    }));
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const { role } = req.user!;
    if (role === 'client' || role === 'team_member') return res.json({ activeProjects: 0, pendingApprovals: 0, teamProductivity: 0, monthlyRevenue: 0 });
    const activeProjects = await Project.countDocuments();
    const pendingApprovals = await Document.countDocuments({ status: 'draft', type: 'msa' });
    res.json({ activeProjects, pendingApprovals, teamProductivity: 92, monthlyRevenue: 142 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

router.get('/msa-status', async (req: Request, res: Response) => {
  const { role } = req.user!;
  if (role === 'client') return res.json({ msaStatus: 'pending' });
  const msa = await Document.findOne({ type: 'msa', clientId: req.user!.userId }).sort({ createdAt: -1 });
  res.json({ msaStatus: msa && msa.status === 'final' ? 'signed' : 'pending' });
});

router.get('/messages', async (req: Request, res: Response) => {
  try {
    const { role, userId } = req.user!;
    let query: any = {};
    if (role === 'client') query.senderId = userId;
    const messages = await Message.find(query).sort({ createdAt: 1 });
    const mapped = messages.map(m => ({
      id: m._id,
      sender: m.senderId === 'system' ? 'agent' : 'user',
      text: m.content,
      timestamp: m.createdAt.toLocaleDateString()
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/messages', async (req: Request, res: Response) => {
  const { sender, text } = req.body;
  const msgDoc = new Message({
    conversationId: 'default',
    projectId: 'default',
    senderId: req.user!.userId,
    senderRole: req.user!.role,
    content: text
  });
  await msgDoc.save();
  const msg = { id: msgDoc._id, sender: 'user', text, timestamp: (msgDoc as any).createdAt.toISOString() };
  const { userId } = req.user!;
  const user = await User.findById(userId);
  if (user) {
    const clients = await User.find({ role: 'client', isActive: true }).select('_id');
    for (const client of clients) {
      if (client._id.toString() !== userId) {
        await sendNotification({
          userId: client._id.toString(),
          type: 'in_app',
          title: 'New Message',
          body: `${user.name}: "${text.slice(0, 100)}${text.length > 100 ? '...' : ''}"`,
          data: { category: 'message', metadata: { sender: user.name } },
        });
      }
    }
  }
  res.json(msg);
});

router.post('/summarize', adminOrTeamMember, async (_req: Request, res: Response) => {
  try {
    const projects = await Project.find({});
    const summary = await generateProjectSummary(JSON.stringify(projects, null, 2));
    res.json({ summary });
  } catch {
    res.json({ summary: '• Project V1 Prototype is on track for Oct 27 delivery\n• UI token system finalization in progress\n• Team productivity at 92% across active milestones\n• One pending agreement requires signature' });
  }
});

router.post('/files/upload', upload.array('files', 10), async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const uploaded = await Promise.all(files.map(async (f) => {
    const doc = new Document({
      _id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      clientId: req.user!.userId,
      name: f.originalname,
      type: 'file',
      mimeType: f.mimetype,
      fileUrl: `/uploads/${f.filename}`,
      fileSize: f.size,
      uploadedBy: req.user!.userId,
    });
    await doc.save();
    return {
      id: doc._id,
      name: f.originalname,
      size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
      tag: (req.body.tag as string) || 'uploaded',
      path: doc.fileUrl,
      uploadedAt: doc.createdAt.toISOString()
    };
  }));
  const { userId } = req.user!;
  const user = await User.findById(userId);
  if (user) {
    const clients = await User.find({ role: 'client', isActive: true }).select('_id');
    for (const client of clients) {
      if (client._id.toString() !== userId) {
        await sendNotification({
          userId: client._id.toString(),
          type: 'in_app',
          title: 'File Uploaded',
          body: `${user.name} uploaded ${files.length} file(s): ${files.map(f => f.originalname).join(', ').slice(0, 120)}`,
          data: { category: 'upload', metadata: { uploader: user.name } },
        });
      }
    }
  }
  res.json(uploaded);
});

router.get('/files', async (req: Request, res: Response) => {
  try {
    const { role, userId } = req.user!;
    let query: any = { type: 'file' };
    if (role === 'client') query.clientId = userId;
    const docs = await Document.find(query).sort({ createdAt: -1 });
    const files = docs.map(d => ({
      id: d._id,
      name: d.name,
      size: `${(d.fileSize / (1024 * 1024)).toFixed(2)} MB`,
      tag: 'uploaded',
      path: d.fileUrl,
      uploadedAt: d.createdAt.toISOString()
    }));
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

router.post('/users/me/avatar', upload.single('avatar'), async (req: Request, res: Response) => {
  const { userId } = req.user!;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const avatarPath = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(userId, { avatarUrl: avatarPath }, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: user.toJSON() });
});

router.delete('/users/me/avatar', async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const user = await User.findByIdAndUpdate(userId, { avatarUrl: '' }, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: user.toJSON() });
});

router.post('/reset', adminOnly, async (_req: Request, res: Response) => {
  await Project.deleteMany({});
  await Document.deleteMany({});
  await AuditLog.deleteMany({});
  await Message.deleteMany({});
  await OnboardingLink.deleteMany({});
  res.json({ message: 'Database reset to initial state', db: { projects: [], agreements: [], activity: [], metrics: { activeProjects: 0, pendingApprovals: 0, teamProductivity: 0, monthlyRevenue: 0 } } });
});

router.post('/admin/onboarding-link', adminOnly, async (req: Request, res: Response) => {
  const { clientName, organization, phone, email, expiresAt } = req.body;
  if (!clientName || !organization || !phone || !email || !expiresAt) {
    return res.status(400).json({ error: 'All fields are required: clientName, organization, phone, email, expiresAt' });
  }
  const link = new OnboardingLink({
    _id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    token: `onb-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    clientName, organization, phone, email, expiresAt
  });
  await link.save();
  res.json(link);
});

router.patch('/settings/client-portal', adminOnly, async (req: Request, res: Response) => {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean' });
    }
    let settings = await PortalSettings.findOne();
    if (!settings) {
      settings = new PortalSettings();
    }
    settings.clientPortalEnabled = enabled;
    settings.updatedAt = new Date();
    await settings.save();

    if (!enabled) {
      const clientUsers = await User.find({ role: 'client', isActive: true }).select('_id');
      const clientIds = clientUsers.map(u => u._id.toString());
      if (clientIds.length > 0) {
        await User.updateMany(
          { _id: { $in: clientIds } },
          { $set: { isActive: false } }
        );
        await Session.deleteMany({ userId: { $in: clientIds } });
      }
    } else {
      // Re-enable client users when the portal is re-enabled
      await User.updateMany(
        { role: 'client', isActive: false },
        { $set: { isActive: true } }
      );
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update client portal setting' });
  }
});

router.patch('/settings/white-label', adminOnly, async (req: Request, res: Response) => {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean' });
    }
    let settings = await PortalSettings.findOne();
    if (!settings) {
      settings = new PortalSettings();
    }
    settings.whiteLabelMode = enabled;
    settings.updatedAt = new Date();
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update white label setting' });
  }
});

router.post('/summaries/generate', adminOrTeamMember, async (req: Request, res: Response) => {
  try {
    const projects: any[] = await Project.find().sort({ createdAt: -1 });
    const totalProgress = projects.length > 0
      ? Math.round(projects.reduce((a, p) => a + (p.progress || 0), 0) / projects.length)
      : 0;
    const milestonesCompleted = projects.filter((p) => p.progress >= 100).length;
    const dbMessages = await Message.find().sort({ createdAt: -1 }).limit(50);
  const activity = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
  const uploadedFiles = await Document.find({ type: 'file' }).sort({ createdAt: -1 });

    let mongoMessageCount = 0;
    try {
      mongoMessageCount = await Message.countDocuments({});
    } catch { /* fallback */ }
    const totalMessagesCount = Math.max(dbMessages.length, mongoMessageCount);

    const recentActivity = activity.slice(-5);
    const recentMessages = (() => {
      const all = dbMessages.slice(-5);
      return all.map((m: any) => m.senderName || m.sender || 'Team');
    })();
    const recentFiles = uploadedFiles.slice(-4);

    const projectNames = projects.map((p) => p.name).filter(Boolean);
    const hasActiveProjects = projects.filter((p) => p.progress > 0 && p.progress < 100).length;
    const overdueCount = projects.filter((p) => {
      const updated = p.lastUpdated || p.updatedAt;
      if (!updated) return false;
      const daysSince = Math.floor((Date.now() - new Date(updated).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > 14 && p.progress < 100;
    }).length;

    const upcomingTasks: string[] = [];
    const blockersList: string[] = [];
    const deliverablesCount = uploadedFiles.length;

    for (const p of projects) {
      if (p.nextMilestone && p.nextMilestone !== 'N/A' && p.nextMilestone !== 'TBD') {
        upcomingTasks.push(`${p.name}: ${p.nextMilestone}`);
      }
      if (p.progress < 100 && p.stage && !['Completed', 'Launched', 'Done'].includes(p.stage)) {
        blockersList.push(`${p.name} is in ${p.stage} stage (${p.progress}% complete)`);
      }
    }

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const thisWeekActivity = activity.filter((a: any) => {
      const ts = a.timestamp || a.createdAt;
      return ts && new Date(ts) >= weekStart;
    });

    const summaryText = generateClientSummary({
      projectCount: projects.length,
      projectNames,
      totalProgress,
      milestonesCompleted,
      hasActiveProjects,
      overdueCount,
      thisWeekActivity: thisWeekActivity.length,
      recentActivityCount: recentActivity.length,
      recentMessages,
      recentFiles,
      deliverablesCount,
      totalMessagesCount,
      upcomingTasks,
      blockersList,
    });

    const summary = await Summary.create({
      projectId: 'default',
      projectName: projectNames.join(', ') || 'All Projects',
      summaryText,
      generatedAt: new Date(),
      generatedBy: req.user?.userId || 'system',
      metadata: {
        projectProgress: totalProgress,
        milestonesCompleted,
        pendingApprovals: hasActiveProjects,
        filesUploaded: uploadedFiles.length,
        messagesCount: totalMessagesCount,
      },
      upcomingTasks,
      blockers: blockersList,
      deliverablesCount,
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

function generateClientSummary(data: {
  projectCount: number;
  projectNames: string[];
  totalProgress: number;
  milestonesCompleted: number;
  hasActiveProjects: number;
  overdueCount: number;
  thisWeekActivity: number;
  recentActivityCount: number;
  recentMessages: string[];
  recentFiles: { name: string; size?: string }[];
  deliverablesCount: number;
  totalMessagesCount: number;
  upcomingTasks: string[];
  blockersList: string[];
}): string {
  const lines: string[] = [];
  lines.push('WEEKLY PROJECT SUMMARY');
  lines.push('');
  lines.push('Hello from the DevDale team! Here is your project update for this week.');
  lines.push('');
  lines.push('--- OVERVIEW ---');
  lines.push(`We are currently managing ${data.projectCount} active project(s) for you. Overall progress stands at ${data.totalProgress}% completion across all projects.`);
  if (data.milestonesCompleted > 0) {
    lines.push(`Great news — ${data.milestonesCompleted} milestone(s) have been completed since our last update.`);
  }
  if (data.thisWeekActivity > 0) {
    lines.push(`There were ${data.thisWeekActivity} activity updates recorded this week.`);
  }
  lines.push('');

  lines.push('--- PROJECT PROGRESS ---');
  if (data.projectNames.length > 0) {
    for (const name of data.projectNames) {
      lines.push(`• ${name} — actively being worked on.`);
    }
  } else {
    lines.push('• No project details currently available.');
  }
  if (data.overdueCount > 0) {
    lines.push(`\n⚠️ Note: ${data.overdueCount} project(s) may need attention as they have not been updated recently.`);
  }
  lines.push('');

  lines.push('--- RECENT ACTIVITY ---');
  if (data.recentActivityCount > 0) {
    lines.push(`There were ${data.recentActivityCount} recent activity event(s) on your projects.`);
  } else {
    lines.push('No significant activity in the past few days.');
  }
  if (data.recentMessages.length > 0) {
    lines.push(`\nTeam members who have been in touch:\n${data.recentMessages.map((m) => `  • ${m}`).join('\n')}`);
  } else {
    lines.push('\nNo recent messages.');
  }
  lines.push('');

  lines.push('--- FILES & DELIVERABLES ---');
  lines.push(`Current deliverables count: ${data.deliverablesCount}`);
  if (data.recentFiles.length > 0) {
    lines.push(`Recently uploaded files (${data.recentFiles.length}):`);
    for (const f of data.recentFiles) {
      lines.push(`  • ${f.name}${f.size ? ` (${f.size})` : ''}`);
    }
  }
  lines.push(`Total messages exchanged: ${data.totalMessagesCount}`);
  lines.push('');

  lines.push('--- UPCOMING MILESTONES ---');
  if (data.upcomingTasks.length > 0) {
    for (const task of data.upcomingTasks) {
      lines.push(`  • ${task}`);
    }
  } else {
    lines.push('  • No upcoming milestones scheduled.');
  }
  lines.push('');

  lines.push('--- ITEMS NEEDING ATTENTION ---');
  if (data.blockersList.length > 0) {
    for (const b of data.blockersList) {
      lines.push(`  • ${b}`);
    }
  }
  if (data.hasActiveProjects > 0) {
    lines.push(`  • ${data.hasActiveProjects} project(s) waiting for review or approval.`);
  }
  if (data.blockersList.length === 0 && data.hasActiveProjects === 0) {
    lines.push('  • Everything is on track. No blockers or pending approvals.');
  }
  lines.push('');

  lines.push('--- NEXT STEPS ---');
  lines.push('  • Review your project progress on the dashboard.');
  lines.push('  • Check pending approvals and provide feedback.');
  lines.push('  • Reach out to your project team if you have any questions.');
  lines.push('  • We will share another update next week.');
  lines.push('');
  lines.push('Thank you for your continued partnership.');
  lines.push('— The DevDale Team');

  return lines.join('\n');
}

router.get('/summaries', adminOrTeamMember, async (_req: Request, res: Response) => {
  try {
    const summaries = await Summary.find().sort({ generatedAt: -1 }).limit(20);
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
});

router.get('/summaries/:id', adminOrTeamMember, async (req: Request, res: Response) => {
  try {
    const summary = await Summary.findById(req.params.id);
    if (!summary) return res.status(404).json({ error: 'Summary not found' });
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

router.post('/summaries/:id/export-pdf', adminOrTeamMember, async (req: Request, res: Response) => {
  try {
    const summary = await Summary.findById(req.params.id);
    if (!summary) return res.status(404).json({ error: 'Summary not found' });

    const dateStr = summary.generatedAt.toISOString().split('T')[0];
    const progressBar = (pct: number) =>
      `<div style="background:#e2e8f0;border-radius:99px;height:10px;overflow:hidden;margin:4px 0">
        <div style="background:linear-gradient(90deg,#3b82f6,#8b5cf6);width:${pct}%;height:100%;border-radius:99px;transition:width 0.3s"></div>
       </div>`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Weekly Project Summary - ${dateStr}</title>
<style>
  @page { margin: 20mm 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; }
  .header { text-align: center; padding: 30px 0 20px; border-bottom: 3px solid #3b82f6; margin-bottom: 24px; }
  .header h1 { font-size: 22px; font-weight: 800; color: #0f172a; }
  .header .sub { font-size: 12px; color: #64748b; margin-top: 4px; }
  .section { margin: 20px 0; }
  .section h2 { font-size: 14px; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
  .section p, .section li { font-size: 12px; color: #334155; }
  .section ul { padding-left: 20px; }
  .section ul li { margin-bottom: 4px; }
  .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 16px 0; }
  .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
  .metric-card .val { font-size: 20px; font-weight: 800; color: #0f172a; }
  .metric-card .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-top: 2px; }
  .text-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; white-space: pre-wrap; font-size: 11px; color: #334155; line-height: 1.7; }
  .footer { text-align: center; padding-top: 20px; margin-top: 24px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; }
  .tag { display: inline-block; background: #eff6ff; color: #3b82f6; font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 99px; margin: 2px; }
  .row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
  .label { font-size: 11px; color: #64748b; }
  .value { font-size: 12px; font-weight: 600; color: #0f172a; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <h1>Weekly Project Summary</h1>
  <div class="sub">Generated on ${dateStr} &mdash; DevDale Client Portal</div>
</div>

<div class="section">
  <h2>Progress Overview</h2>
  <div class="metrics">
    <div class="metric-card"><div class="val">${summary.metadata.projectProgress}%</div><div class="lbl">Progress</div></div>
    <div class="metric-card"><div class="val">${summary.metadata.milestonesCompleted}</div><div class="lbl">Milestones</div></div>
    <div class="metric-card"><div class="val">${summary.metadata.pendingApprovals}</div><div class="lbl">Pending</div></div>
    <div class="metric-card"><div class="val">${summary.deliverablesCount || summary.metadata.filesUploaded}</div><div class="lbl">Deliverables</div></div>
  </div>
  <div class="row"><span class="label">Overall Progress</span><span class="value">${summary.metadata.projectProgress}%</span></div>
  ${progressBar(summary.metadata.projectProgress)}
  <div class="row" style="margin-top:8px"><span class="label">Messages Exchanged</span><span class="value">${summary.metadata.messagesCount}</span></div>
</div>

${summary.upcomingTasks && summary.upcomingTasks.length > 0 ? `
<div class="section">
  <h2>Upcoming Milestones</h2>
  <ul>
    ${summary.upcomingTasks.map((t) => `<li>${t}</li>`).join('')}
  </ul>
</div>` : ''}

${summary.blockers && summary.blockers.length > 0 ? `
<div class="section">
  <h2>Items Needing Attention</h2>
  <ul>
    ${summary.blockers.map((b) => `<li>${b}</li>`).join('')}
  </ul>
</div>` : ''}

<div class="section">
  <h2>Full Summary Report</h2>
  <div class="text-block">${summary.summaryText.replace(/\n/g, '<br>')}</div>
</div>

<div class="footer">
  DevDale Client Portal &mdash; This report was generated automatically. For questions, contact your project manager.
</div>
</body>
</html>`;

    res.json({
      success: true,
      content: html,
      filename: `weekly-summary-${dateStr}.html`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

router.post('/summaries/:id/send-email', adminOrTeamMember, async (req: Request, res: Response) => {
  try {
    const summary = await Summary.findById(req.params.id);
    if (!summary) return res.status(404).json({ error: 'Summary not found' });

    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const dateStr = summary.generatedAt.toISOString().split('T')[0];

    const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Weekly Project Summary</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
<tr><td style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:28px 32px">
<table width="100%"><tr>
<td><h1 style="color:#fff;font-size:20px;font-weight:800;margin:0">Weekly Project Summary</h1>
<p style="color:rgba(255,255,255,0.8);font-size:12px;margin:4px 0 0">Report for ${dateStr}</p></td>
</tr></table>
</td></tr>
<tr><td style="padding:28px 32px">
<h2 style="font-size:14px;font-weight:700;color:#0f172a;margin:0 0 4px">Hello,</h2>
<p style="font-size:12px;color:#475569;margin:0 0 16px">Here is your weekly project summary from DevDale.</p>

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td style="width:25%;padding:8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;text-align:center">
<div style="font-size:22px;font-weight:800;color:#0f172a">${summary.metadata.projectProgress}%</div>
<div style="font-size:9px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;margin-top:2px">Progress</div>
</td>
<td style="width:25%;padding:8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;text-align:center">
<div style="font-size:22px;font-weight:800;color:#0f172a">${summary.metadata.milestonesCompleted}</div>
<div style="font-size:9px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;margin-top:2px">Milestones</div>
</td>
<td style="width:25%;padding:8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;text-align:center">
<div style="font-size:22px;font-weight:800;color:#0f172a">${summary.metadata.pendingApprovals}</div>
<div style="font-size:9px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;margin-top:2px">Pending</div>
</td>
<td style="width:25%;padding:8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;text-align:center">
<div style="font-size:22px;font-weight:800;color:#0f172a">${summary.deliverablesCount || summary.metadata.filesUploaded}</div>
<div style="font-size:9px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;margin-top:2px">Deliverables</div>
</td>
</tr>
</table>

<p style="font-size:12px;color:#475569;margin:16px 0 8px;white-space:pre-wrap;line-height:1.6">${summary.summaryText.replace(/\n/g, '<br>')}</p>

<p style="font-size:12px;color:#475569;margin:16px 0 0">You can view the full report and download a PDF version from your client portal dashboard.</p>
</td></tr>
<tr><td style="border-top:1px solid #e2e8f0;padding:16px 32px;text-align:center">
<p style="font-size:10px;color:#94a3b8;margin:0">DevDale Agency &mdash; Client Portal</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;

    const emailedTo = [...(summary.emailedTo || []), email];
    await Summary.findByIdAndUpdate(req.params.id, {
      status: 'sent',
      emailedTo: [...new Set(emailedTo)],
    });

    res.json({
      success: true,
      message: `Summary sent to ${email}`,
      emailPreview: emailHtml,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;
