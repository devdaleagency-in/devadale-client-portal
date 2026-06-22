import { Router } from 'express';
import * as deadlineController from './deadline.controller';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.get('/deadlines', deadlineController.getDeadlines);

// Only admins and super_admins can manage deadlines
router.post('/deadlines', authorize('admin', 'super_admin'), deadlineController.createDeadline);
router.put('/deadlines/:id', authorize('admin', 'super_admin'), deadlineController.updateDeadline);
router.delete('/deadlines/:id', authorize('admin', 'super_admin'), deadlineController.deleteDeadline);

export default router;
