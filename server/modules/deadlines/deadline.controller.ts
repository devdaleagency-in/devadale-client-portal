import { Request, Response } from 'express';
import * as deadlineService from './deadline.service';
import Project from '../../models/Project';

export const getDeadlines = async (req: Request, res: Response) => {
  try {
    const { role, userId } = req.user!;
    let filter: any = {};

    if (role === 'client') {
      filter.clientId = userId;
    } else if (role === 'team_member') {
      // Team members only see deadlines for projects they are assigned to
      const myProjects = await Project.find({ 'team._id': userId });
      const projectIds = myProjects.map(p => p.id || p._id.toString());
      filter.projectId = { $in: projectIds };
    }

    const deadlines = await deadlineService.getDeadlines(filter);
    // Format them for the frontend
    const formatted = deadlines.map(d => ({
      id: d._id.toString(),
      task: d.task,
      dueDate: d.dueDate.toISOString(),
      projectId: d.projectId,
      project: d.project,
      clientId: d.clientId,
      assignee: d.assignee,
      priority: d.priority,
      status: d.status
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createDeadline = async (req: Request, res: Response) => {
  try {
    const deadline = await deadlineService.createDeadline(req.body);
    res.status(201).json(deadline);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateDeadline = async (req: Request, res: Response) => {
  try {
    const deadline = await deadlineService.updateDeadline(req.params.id, req.body);
    if (!deadline) {
      return res.status(404).json({ error: 'Deadline not found' });
    }
    res.json(deadline);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteDeadline = async (req: Request, res: Response) => {
  try {
    const deadline = await deadlineService.deleteDeadline(req.params.id);
    if (!deadline) {
      return res.status(404).json({ error: 'Deadline not found' });
    }
    res.json({ message: 'Deadline deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
