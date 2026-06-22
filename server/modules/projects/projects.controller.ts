import { Request, Response } from 'express';
import * as projectsService from './projects.service';

export async function listProjects(req: Request, res: Response) {
  try {
    const projects = await projectsService.listProjects(req.user!.userId, req.user!.role);
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getProject(req: Request, res: Response) {
  try {
    const project = await projectsService.getProject(req.params.id, req.user!.userId, req.user!.role);
    res.json(project);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function createProject(req: Request, res: Response) {
  try {
    const project = await projectsService.createProject(req.body);
    res.status(201).json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateProject(req: Request, res: Response) {
  try {
    const project = await projectsService.updateProject(req.params.id, req.body, req.user!.userId, req.user!.role);
    res.json(project);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function deleteProject(req: Request, res: Response) {
  try {
    await projectsService.deleteProject(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function getProjectStats(_req: Request, res: Response) {
  try {
    const stats = await projectsService.getProjectStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
