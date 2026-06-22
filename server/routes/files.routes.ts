import { Router, Request, Response } from 'express';
import { verifyAccessToken } from '../tokens/tokenService';
import { storage } from '../storage';

const router = Router();

router.get('/download', async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    if (!token) return res.status(401).send('Missing token');

    const payload = verifyAccessToken(token);
    if (payload.type !== 'file_download') {
      return res.status(403).send('Invalid token type');
    }

    const key = payload.fileKey as string;
    if (!key) return res.status(400).send('Invalid file key');

    const buffer = await storage.download(key);
    
    // Guess MIME from extension loosely
    const ext = key.split('.').pop()?.toLowerCase();
    let mime = 'application/octet-stream';
    if (ext === 'pdf') mime = 'application/pdf';
    else if (ext === 'png') mime = 'image/png';
    else if (ext === 'jpg' || ext === 'jpeg') mime = 'image/jpeg';
    
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="${key.split('/').pop()}"`);
    res.send(buffer);
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') return res.status(401).send('URL expired');
    res.status(404).send('File not found or invalid access');
  }
});

export default router;
