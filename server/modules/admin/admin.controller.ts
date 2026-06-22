import { Request, Response } from 'express';
import * as adminService from './admin.service';

export async function listTeamMembers(_req: Request, res: Response) {
  try {
    const members = await adminService.listTeamMembers();
    res.json(members);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function listClients(req: Request, res: Response) {
  try {
    const result = await adminService.listClients(req.query as any);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateClientStatus(req: Request, res: Response) {
  try {
    const user = await adminService.updateClientStatus(req.params.id, req.body.isActive);
    res.json({ user: user.toJSON() });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function getPortalSettings(_req: Request, res: Response) {
  try {
    const settings = await adminService.getPortalSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updatePortalSettings(req: Request, res: Response) {
  try {
    const settings = await adminService.updatePortalSettings(req.body);
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getDashboardStats(_req: Request, res: Response) {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
