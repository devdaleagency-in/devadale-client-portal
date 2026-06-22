import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional().default(''),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().default(''),
  source: z.enum(['website', 'referral', 'direct', 'social', 'email', 'phone', 'other'] as const).optional().default('website'),
  value: z.number().min(0).optional().default(0),
  notes: z.string().optional().default(''),
  assignedTo: z.string().optional(),
});

export const updateLeadSchema = z.object({
  name: z.string().min(1).optional(),
  company: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  source: z.enum(['website', 'referral', 'direct', 'social', 'email', 'phone', 'other'] as const).optional(),
  stage: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as const).optional(),
  value: z.number().min(0).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  lostReason: z.string().optional(),
});

export const leadQuerySchema = z.object({
  stage: z.string().optional(),
  source: z.string().optional(),
  assignedTo: z.string().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
});
