import { Router, Request, Response } from 'express';
import Revision from '../models/Revision';
import User from '../models/User';
import Project from '../models/Project';
import { authenticate } from '../middleware/authenticate';
import { sendNotification } from '../services/notification.service';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const filter = ['admin', 'super_admin', 'team_member'].includes(role) ? {} : { userId };
    const revisions = await Revision.find(filter).sort({ createdAt: -1 });
    res.json(revisions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const { projectId, title, description, priority } = req.body;
    if (!projectId || !title) {
      return res.status(400).json({ error: 'Project and title are required' });
    }
    const revision = await Revision.create({
      _id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      projectId,
      title,
      description: description || '',
      priority: priority || 'medium',
    });

    const user = await User.findById(userId);
    const project = await Project.findById(projectId);

    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    for (const admin of admins) {
      await sendNotification({
        userId: admin._id.toString(),
        type: 'in_app',
        title: 'Revision Requested',
        body: `${user?.name || 'A user'} requested a revision on "${project?.name || 'a project'}": "${title}"`,
        data: { category: 'task', metadata: { projectId, revisionId: revision._id, priority } },
      });
    }

    res.status(201).json(revision);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
