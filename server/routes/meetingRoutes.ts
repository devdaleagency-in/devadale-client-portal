import { Router, Request, Response } from 'express';
import Meeting from '../models/Meeting';
import User from '../models/User';
import { authenticate } from '../middleware/authenticate';
import { sendNotification } from '../services/notification.service';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const filter = ['admin', 'super_admin', 'team_member'].includes(role) ? {} : { userId };
    const meetings = await Meeting.find(filter).sort({ createdAt: -1 });
    res.json(meetings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const { projectId, title, date, time, meetingType, notes } = req.body;
    if (!title || !date || !time) {
      return res.status(400).json({ error: 'Title, date, and time are required' });
    }
    const meeting = await Meeting.create({
      _id: `meeting-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      projectId: projectId || '',
      title,
      date,
      time,
      meetingType: meetingType || 'client_call',
      notes: notes || '',
    });

    const user = await User.findById(userId);
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    for (const admin of admins) {
      await sendNotification({
        userId: admin._id.toString(),
        type: 'in_app',
        title: 'Meeting Scheduled',
        body: `${user?.name || 'A user'} scheduled a meeting: "${title}" on ${date} at ${time}.`,
        data: { category: 'activity', metadata: { meetingId: meeting._id } },
      });
    }

    res.status(201).json(meeting);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
