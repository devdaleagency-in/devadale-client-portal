import { Request, Response } from 'express';
import * as documentsService from './documents.service';

export async function listDocuments(req: Request, res: Response) {
  try {
    const result = await documentsService.listDocuments(req.query as any, req.user?.userId, req.user?.role);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getDocument(req: Request, res: Response) {
  try {
    const doc = await documentsService.getDocument(req.params.id, req.user?.userId, req.user?.role);
    res.json(doc);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function createDocument(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    const file = files?.[0];
    const doc = await documentsService.createDocument(req.body, file, req.user!.userId, req.user!.role);
    res.status(201).json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateDocument(req: Request, res: Response) {
  try {
    const doc = await documentsService.updateDocument(req.params.id, req.body, req.user!.userId, req.user!.role);
    res.json(doc);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function uploadNewVersion(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    const file = files?.[0];
    if (!file) return res.status(400).json({ error: 'File is required' });
    const changeNotes = req.body.changeNotes || '';
    const doc = await documentsService.updateDocumentFile(req.params.id, file, changeNotes, req.user!.userId, req.user!.role);
    res.json(doc);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function signDocument(req: Request, res: Response) {
  try {
    const { signatureUrl } = req.body;
    const doc = await documentsService.signDocument(req.params.id, signatureUrl, req.user!.userId, req.user!.role);
    res.json(doc);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function deleteDocument(req: Request, res: Response) {
  try {
    await documentsService.deleteDocument(req.params.id, req.user!.userId, req.user!.role);
    res.json({ message: 'Document archived' });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function getDocumentVersions(req: Request, res: Response) {
  try {
    const versions = await documentsService.getDocumentVersions(req.params.id, req.user?.userId, req.user?.role);
    res.json(versions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getDocumentDownloadUrl(req: Request, res: Response) {
  try {
    const url = await documentsService.getSignedDocumentUrl(req.params.id, req.user?.userId, req.user?.role);
    res.json({ url });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}
