import { z } from 'zod';

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  amount: z.number().min(0),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  projectId: z.string().optional(),
  amount: z.number().min(0),
  tax: z.number().min(0).optional().default(0),
  cgst: z.number().min(0).optional().default(0),
  sgst: z.number().min(0).optional().default(0),
  igst: z.number().min(0).optional().default(0),
  total: z.number().min(0),
  currency: z.string().optional().default('INR'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional().default(''),
  lineItems: z.array(lineItemSchema).optional().default([]),
});

export const updateInvoiceSchema = z.object({
  status: z.enum(['draft', 'sent', 'viewed', 'paid', 'partially_paid', 'overdue', 'cancelled'] as const).optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
});

export const createPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().min(0),
  currency: z.string().optional().default('INR'),
  gateway: z.enum(['razorpay', 'stripe', 'paypal', 'bank_transfer', 'cash', 'other'] as const),
  gatewayTxnId: z.string().optional().default(''),
  status: z.enum(['pending', 'completed', 'failed', 'refunded'] as const).optional().default('completed'),
});
