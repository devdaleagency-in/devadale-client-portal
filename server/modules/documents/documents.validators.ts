import { z } from 'zod';

export const createDocumentSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  projectId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['file', 'agreement', 'msa', 'sow', 'nda', 'invoice', 'report', 'other'] as const).optional().default('file'),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['draft', 'final', 'archived'] as const).optional().default('draft'),
  expiresAt: z.string().optional(),
});

export const updateDocumentSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['draft', 'final', 'archived'] as const).optional(),
  tags: z.array(z.string()).optional(),
  expiresAt: z.string().optional(),
});

export const signDocumentSchema = z.object({
  signatureUrl: z.string().min(1, 'Signature URL is required'),
});
