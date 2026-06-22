import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import * as notificationsController from './notifications.controller';
import { sendNotificationSchema } from './notifications.validators';

const router = Router();

router.use(authenticate);

router.get('/notifications', notificationsController.listNotifications);
router.get('/notifications/unread-count', notificationsController.getUnreadCount);
router.post('/notifications/:id/read', notificationsController.markAsRead);
router.post('/notifications/read-all', notificationsController.markAllAsRead);
router.post('/notifications/send', authorize('admin'), validate(sendNotificationSchema), notificationsController.createAndSendNotification);

export default router;
