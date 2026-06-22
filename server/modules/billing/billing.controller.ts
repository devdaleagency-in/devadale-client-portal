import { Request, Response } from 'express';
import * as billingService from './billing.service';

export async function listInvoices(req: Request, res: Response) {
  try {
    const result = await billingService.listInvoices(req.query as any, req.user?.userId, req.user?.role);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getInvoice(req: Request, res: Response) {
  try {
    const invoice = await billingService.getInvoice(req.params.id, req.user?.userId, req.user?.role);
    res.json(invoice);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function createInvoice(req: Request, res: Response) {
  try {
    const invoice = await billingService.createInvoice(req.body, req.user!.userId, req.user!.role);
    res.status(201).json(invoice);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateInvoice(req: Request, res: Response) {
  try {
    const invoice = await billingService.updateInvoice(req.params.id, req.body, req.user!.userId, req.user!.role);
    res.json(invoice);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function deleteInvoice(req: Request, res: Response) {
  try {
    await billingService.deleteInvoice(req.params.id, req.user!.userId, req.user!.role);
    res.json({ message: 'Invoice cancelled' });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function recordPayment(req: Request, res: Response) {
  try {
    const result = await billingService.recordPayment(req.body, req.user!.userId, req.user!.role);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function getInvoicePayments(req: Request, res: Response) {
  try {
    const payments = await billingService.getInvoicePayments(req.params.id, req.user?.userId, req.user?.role);
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getBillingStats(req: Request, res: Response) {
  try {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const stats = await billingService.getBillingStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
