import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import * as crmController from './crm.controller';
import { createLeadSchema, updateLeadSchema } from './crm.validators';

const router = Router();

router.use(authenticate);

router.get('/leads', authorize('admin', 'team_member'), crmController.listLeads);
router.get('/leads/pipeline', authorize('admin', 'team_member'), crmController.getPipelineStats);
router.get('/leads/:id', authorize('admin', 'team_member'), crmController.getLead);
router.post('/leads', authorize('admin', 'team_member'), validate(createLeadSchema), crmController.createLead);
router.put('/leads/:id', validate(updateLeadSchema), crmController.updateLead);
router.delete('/leads/:id', authorize('admin'), crmController.deleteLead);
router.post('/leads/:id/convert', crmController.convertLead);

export default router;
