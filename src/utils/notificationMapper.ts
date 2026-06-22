import type { AppNotification, NotificationCategory } from '../types';

const CATEGORY_MAP: Record<string, NotificationCategory> = {
  approval: 'approval',
  message: 'message',
  upload: 'upload',
  billing: 'billing',
  task: 'task',
  system: 'system',
  activity: 'activity',
};

function inferCategory(data?: Record<string, any>, title?: string, body?: string): NotificationCategory {
  if (data?.category && CATEGORY_MAP[data.category]) return CATEGORY_MAP[data.category];
  const text = `${title} ${body}`.toLowerCase();
  if (text.includes('approv') || text.includes('sign') || text.includes('msa')) return 'approval';
  if (text.includes('message') || text.includes('chat')) return 'message';
  if (text.includes('upload') || text.includes('file') || text.includes('document')) return 'upload';
  if (text.includes('invoice') || text.includes('payment') || text.includes('billing')) return 'billing';
  if (text.includes('task') || text.includes('milestone') || text.includes('deadline')) return 'task';
  if (text.includes('activity') || text.includes('update')) return 'activity';
  return 'system';
}

function inferActionType(data?: Record<string, any>, category?: NotificationCategory): 'approve' | 'reject' | 'preview' | 'download' | 'view' | undefined {
  if (data?.actionType) return data.actionType as any;
  if (data?.actionable === false) return undefined;
  if (category === 'approval') return 'approve';
  if (category === 'upload' || category === 'billing') return 'preview';
  if (category === 'message') return 'view';
  return undefined;
}

export function mapBackendNotification(notif: any): AppNotification {
  const category = inferCategory(notif.data, notif.title, notif.body);
  return {
    id: notif._id,
    category,
    title: notif.title,
    message: notif.body,
    timestamp: notif.createdAt || new Date().toISOString(),
    read: notif.status === 'read',
    actionable: notif.data?.actionable !== false && !!inferActionType(notif.data, category),
    actor: notif.data?.actor ? { name: notif.data.actor.name, avatarUrl: notif.data.actor.avatarUrl || '' } : undefined,
    target: notif.data?.target,
    actionType: inferActionType(notif.data, category),
    metadata: notif.data?.metadata,
  };
}

export function mapBackendNotifications(notifications: any[]): AppNotification[] {
  return notifications.map(mapBackendNotification);
}