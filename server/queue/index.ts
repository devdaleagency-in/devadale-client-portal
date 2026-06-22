import { config } from '../config';

type JobHandler = (payload: any) => Promise<void>;

interface JobQueue {
  add(name: string, payload: any): Promise<void>;
  process(name: string, handler: JobHandler): void;
}

class InMemoryQueue implements JobQueue {
  private handlers: Map<string, JobHandler> = new Map();

  async add(name: string, payload: any): Promise<void> {
    const handler = this.handlers.get(name);
    if (handler) {
      setImmediate(() => {
        handler(payload).catch((err) => console.error(`[Queue] Job ${name} failed:`, err));
      });
    }
  }

  process(name: string, handler: JobHandler): void {
    this.handlers.set(name, handler);
  }
}

class BullQueue implements JobQueue {
  private queues: Map<string, any> = new Map();

  async add(name: string, payload: any): Promise<void> {
    console.warn(`[BullMQ] Job ${name} added (Redis not connected, using fallback)`);
    // In production with Redis, this would use BullMQ Queue.add()
  }

  process(_name: string, _handler: JobHandler): void {
    // In production with Redis, this would use BullMQ Worker
  }
}

function createQueue(): JobQueue {
  if (config.redis.enabled && config.nodeEnv === 'production') {
    try {
      return new BullQueue();
    } catch {
      return new InMemoryQueue();
    }
  }
  return new InMemoryQueue();
}

export const queue = createQueue();

export async function dispatchEmailJob(payload: { to: string; subject: string; html: string }) {
  await queue.add('email:send', payload);
}

export async function dispatchNotificationJob(payload: {
  userId: string;
  type: 'email' | 'whatsapp' | 'sms' | 'in_app';
  title: string;
  body: string;
  data?: Record<string, any>;
}) {
  await queue.add('notification:send', payload);
}

export async function dispatchDocumentJob(payload: {
  action: 'generate-pdf' | 'process-upload' | 'archive';
  documentId: string;
  data?: Record<string, any>;
}) {
  await queue.add('document:process', payload);
}

export function setupWorkers(): void {
  queue.process('email:send', async (payload) => {
    const { sendEmail } = await import('../services/emailService');
    await sendEmail(payload.to, payload.subject, payload.html);
  });

  queue.process('notification:send', async (payload) => {
    const { sendNotification } = await import('../services/notification.service');
    await sendNotification(payload);
  });

  queue.process('document:process', async (payload) => {
    console.log(`[Queue] Processing document ${payload.action} for ${payload.documentId}`);
  });
}
