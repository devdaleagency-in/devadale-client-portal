import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { adminOnly } from '../../middleware/authorize';
import * as adminController from './admin.controller';

const router = Router();

router.use(authenticate);

router.get('/admin/team', adminOnly, adminController.listTeamMembers);
router.get('/admin/clients', adminOnly, adminController.listClients);
router.patch('/admin/clients/:id/status', adminOnly, adminController.updateClientStatus);
router.get('/admin/settings/portal', adminOnly, adminController.getPortalSettings);
router.patch('/admin/settings/portal', adminOnly, adminController.updatePortalSettings);
router.get('/admin/dashboard/stats', adminOnly, adminController.getDashboardStats);

export default router;
