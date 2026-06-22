import { Request, Response } from 'express';
import * as notificationsService from './notifications.service';
import { sendNotification } from '../../services/notification.service';

export async function listNotifications(req: Request, res: Response) {
  try {
    const notifications = await notificationsService.getNotifications(req.user!.userId);
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getUnreadCount(req: Request, res: Response) {
  try {
    const count = await notificationsService.getUnreadCount(req.user!.userId);
    res.json({ count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const notification = await notificationsService.markAsRead(req.params.id, req.user!.userId);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function markAllAsRead(req: Request, res: Response) {
  try {
    await notificationsService.markAllAsRead(req.user!.userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createAndSendNotification(req: Request, res: Response) {
  try {
    await sendNotification(req.body);
    res.status(201).json({ message: 'Notification sent' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
