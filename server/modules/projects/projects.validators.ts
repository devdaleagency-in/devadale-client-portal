import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  client: z.string().min(1, 'Client name is required'),
  clientId: z.string().optional(),
  description: z.string().optional(),
  stage: z.string().optional().default('Discovery'),
  category: z.string().optional(),
  health: z.enum(['healthy', 'warning', 'critical']).optional().default('healthy'),
  iconName: z.string().optional().default('palette'),
  assignedMembers: z.array(z.string()).optional().default([]),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  client: z.string().optional(),
  description: z.string().optional(),
  stage: z.string().optional(),
  category: z.string().optional(),
  health: z.enum(['healthy', 'warning', 'critical']).optional(),
  progress: z.number().min(0).max(100).optional(),
  nextMilestone: z.string().optional(),
  nextMilestoneDate: z.string().optional(),
  iconName: z.string().optional(),
  assignedMembers: z.array(z.string()).optional(),
});
