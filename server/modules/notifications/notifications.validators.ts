import { z } from 'zod';

export const sendNotificationSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(['email', 'whatsapp', 'sms', 'in_app'] as const),
  title: z.string().min(1),
  body: z.string().min(1),
  data: z.record(z.string(), z.any()).optional(),
});
