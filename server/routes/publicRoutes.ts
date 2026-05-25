import { Router, Request, Response } from 'express';
import { getOnboardingLinkByToken, consumeOnboardingLink } from '../db';
import PortalSettings from '../models/PortalSettings';

const router = Router();

router.get('/portal-status', async (_req: Request, res: Response) => {
  try {
    const settings = await PortalSettings.findOne();
    res.json({ clientPortalEnabled: settings ? settings.clientPortalEnabled : true });
  } catch {
    res.json({ clientPortalEnabled: true });
  }
});

router.get('/onboarding/verify/:token', (req: Request, res: Response) => {
  const link = getOnboardingLinkByToken(req.params.token);
  if (!link) return res.status(404).json({ error: 'Onboarding link not found' });
  if (link.status === 'used') return res.status(410).json({ error: 'Onboarding link has already been used' });
  if (new Date(link.expiresAt) < new Date()) {
    return res.status(410).json({ error: 'Onboarding link has expired' });
  }
  res.json({ valid: true, clientName: link.clientName, organization: link.organization, email: link.email });
});

router.post('/onboarding/consume/:token', (req: Request, res: Response) => {
  const link = consumeOnboardingLink(req.params.token);
  if (!link) return res.status(404).json({ error: 'Onboarding link not found' });
  res.json({ message: 'Link consumed', clientName: link.clientName, email: link.email });
});

export default router;
