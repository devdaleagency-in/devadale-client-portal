import { Request, Response, NextFunction } from 'express';
import Project from '../models/Project';
import Document from '../models/Document';
import Invoice from '../models/Invoice';

export function requireProjectAccess(param = 'id') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      if (['super_admin', 'admin', 'team_member'].includes(req.user.role)) return next();
      
      const project = await Project.findById(req.params[param]);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      
      if (project.clientId !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  };
}

export function requireDocumentAccess(param = 'id') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      if (['super_admin', 'admin', 'team_member'].includes(req.user.role)) return next();
      
      const doc = await Document.findById(req.params[param]);
      if (!doc) return res.status(404).json({ error: 'Document not found' });
      
      const project = await Project.findById(doc.projectId);
      if (!project || project.clientId !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  };
}

export function requireInvoiceAccess(param = 'id') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      if (['super_admin', 'admin', 'team_member'].includes(req.user.role)) return next();
      
      const invoice = await Invoice.findById(req.params[param]);
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
      
      if (invoice.clientId !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  };
}
