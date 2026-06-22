import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/authenticate';
import Conversation from '../models/Conversation';
import { uploadFile, getSignedUrl } from '../storage';

const router = Router();
router.use(authenticate);

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

router.post('/:id/messages/upload', upload.array('attachments', 5), async (req: Request, res: Response) => {
  const { userId } = req.user!;
  
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const isClient = conversation.clientId === userId;
    const isAdmin = conversation.adminIds.some((id: string) => id === userId);
    if (!isClient && !isAdmin) return res.status(403).json({ error: 'Access denied' });

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const attachments = await Promise.all(
      files.map(async (file) => {
        const { key } = await uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          'messages',
          conversation.clientId
        );
        const signedUrl = await getSignedUrl(key);
        return {
          name: file.originalname,
          url: signedUrl,
          type: file.mimetype,
          size: file.size,
        };
      })
    );

    res.json({ attachments });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to upload attachments', message: err.message });
  }
});

export default router;
