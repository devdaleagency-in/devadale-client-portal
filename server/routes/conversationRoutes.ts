import { Router, Request, Response } from 'express';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import User from '../models/User';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

async function getDisplayName(userId: string): Promise<string> {
  try {
    const user = await User.findById(userId);
    return user?.name || userId;
  } catch {
    return userId;
  }
}

router.get('/', async (req: Request, res: Response) => {
  const { userId, role } = req.user!;
  try {
    const filter = role === 'admin'
      ? { adminIds: userId }
      : { clientId: userId };

    const conversations = await Conversation.find(filter)
      .sort({ updatedAt: -1 });

    const result = await Promise.all(conversations.map(async (conv) => {
      const msgCount = await Message.countDocuments({
        conversationId: conv._id.toString(),
        isRead: false,
        senderId: { $ne: userId },
      });
      const unread = conv.unreadCounts?.get(userId) || 0;
      return {
        _id: conv._id,
        projectId: { _id: conv.projectId, name: conv.projectName || '' },
        clientId: { _id: conv.clientId, name: conv.clientName || (await getDisplayName(conv.clientId)), role: 'client' },
        lastMessage: conv.lastMessage || null,
        unreadCount: Math.max(unread, msgCount),
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { userId, role } = req.user!;
  const { projectId, projectName, clientId, clientName } = req.body;

  if (!projectId) {
    return res.status(400).json({ error: 'projectId is required' });
  }
  
  // Force clientId to be the requester if they are a client
  const resolvedClientId = role === 'client' ? userId : clientId;
  if (!resolvedClientId) {
    return res.status(400).json({ error: 'clientId is required' });
  }

  try {
    const existing = await Conversation.findOne({ projectId });
    if (existing) return res.json(existing);

    const conversation = await Conversation.create({
      projectId,
      projectName: projectName || 'Untitled Project',
      clientId: resolvedClientId,
      clientName: clientName || (await getDisplayName(resolvedClientId)),
      adminIds: role === 'admin' ? [userId] : ['user-1'],
    });

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const { userId } = req.user!;
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const isClient = conversation.clientId === userId;
    const isAdmin = conversation.adminIds.some((id: string) => id === userId);
    if (!isClient && !isAdmin) return res.status(403).json({ error: 'Access denied' });

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

router.get('/:id/messages', async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const skip = (page - 1) * limit;

  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const isClient = conversation.clientId === userId;
    const isAdmin = conversation.adminIds.some((id: string) => id === userId);
    if (!isClient && !isAdmin) return res.status(403).json({ error: 'Access denied' });

    const [messages, total] = await Promise.all([
      Message.find({ conversationId: req.params.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ conversationId: req.params.id }),
    ]);

    const enriched = messages.reverse().map((msg) => ({
      _id: msg._id,
      senderId: { _id: msg.senderId, name: msg.senderName || '', role: msg.senderRole },
      senderRole: msg.senderRole,
      conversationId: msg.conversationId,
      projectId: msg.projectId,
      content: msg.content,
      isRead: msg.isRead,
      deliveryStatus: msg.deliveryStatus,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }));

    res.json({
      messages: enriched,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/seed', async (_req: Request, res: Response) => {
  try {
    const existing = await Conversation.findOne();
    if (existing) return res.json({ message: 'Conversations already seeded' });

    const conv = await Conversation.create({
      projectId: 'proj-focus',
      projectName: 'DevDale Agency',
      clientId: 'user-2',
      clientName: 'Sarah Chen',
      adminIds: ['user-1'],
      lastMessage: null,
    });

    await Message.create({
      senderId: 'user-2',
      senderName: 'Sarah Chen',
      senderRole: 'client',
      conversationId: conv._id.toString(),
      projectId: 'proj-focus',
      content: 'Hi! I had a question about the V1 prototype timeline. When can we expect the first review?',
      deliveryStatus: 'sent',
    });

    await Message.create({
      senderId: 'user-1',
      senderName: 'Admin User',
      senderRole: 'admin',
      conversationId: conv._id.toString(),
      projectId: 'proj-focus',
      content: 'Hi Sarah! The V1 prototype is on track for Friday, Oct 27. I will share the Figma link with you by Thursday for early feedback.',
      deliveryStatus: 'read',
      isRead: true,
    });

    await Conversation.findByIdAndUpdate(conv._id, {
      lastMessage: {
        content: 'Hi Sarah! The V1 prototype is on track for Friday, Oct 27.',
        senderId: 'user-1',
        senderRole: 'admin',
        timestamp: new Date(),
      },
    });

    res.json({ message: 'Conversation seeded', conversationId: conv._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed conversations' });
  }
});

export default router;
