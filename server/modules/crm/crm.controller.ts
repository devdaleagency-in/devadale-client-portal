import { Request, Response } from 'express';
import * as crmService from './crm.service';
import { createAuditLog } from '../../services/audit.service';

export async function listLeads(req: Request, res: Response) {
  try {
    const result = await crmService.listLeads(req.query as any);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getLead(req: Request, res: Response) {
  try {
    const lead = await crmService.getLead(req.params.id);
    res.json(lead);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function createLead(req: Request, res: Response) {
  try {
    const lead = await crmService.createLead(req.body, req.user!.userId, req.user!.role);
    res.status(201).json(lead);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateLead(req: Request, res: Response) {
  try {
    const lead = await crmService.updateLead(req.params.id, req.body, req.user!.userId, req.user!.role);
    res.json(lead);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function deleteLead(req: Request, res: Response) {
  try {
    await crmService.deleteLead(req.params.id, req.user!.userId, req.user!.role);
    res.json({ message: 'Lead deleted' });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function getPipelineStats(_req: Request, res: Response) {
  try {
    const stats = await crmService.getPipelineStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function convertLead(req: Request, res: Response) {
  try {
    const lead = await crmService.getLead(req.params.id);
    if (lead.stage === 'won') {
      return res.status(400).json({ error: 'Lead already converted' });
    }

    const updated = await crmService.updateLead(
      req.params.id,
      { stage: 'won', convertedToClientAt: new Date() },
      req.user!.userId,
      req.user!.role
    );

    await createAuditLog({
      userId: req.user!.userId,
      userRole: req.user!.role,
      action: 'update',
      entity: 'Lead',
      entityId: lead._id,
      description: `Converted lead to client: ${lead.name}`,
    });

    res.json(updated);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}
