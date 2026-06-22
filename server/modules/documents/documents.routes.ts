import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { requireDocumentAccess } from '../../middleware/resourceGuard';
import * as documentsController from './documents.controller';
import { createDocumentSchema, updateDocumentSchema, signDocumentSchema } from './documents.validators';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.use(authenticate);

router.get('/documents', documentsController.listDocuments);
router.get('/documents/:id', requireDocumentAccess('id'), documentsController.getDocument);
router.get('/documents/:id/versions', requireDocumentAccess('id'), documentsController.getDocumentVersions);
router.get('/documents/:id/download', requireDocumentAccess('id'), documentsController.getDocumentDownloadUrl);
router.post(
  '/documents',
  authorize('admin', 'team_member'),
  upload.array('files', 1),
  validate(createDocumentSchema),
  documentsController.createDocument
);
router.put(
  '/documents/:id',
  requireDocumentAccess('id'),
  authorize('admin', 'team_member'),
  validate(updateDocumentSchema),
  documentsController.updateDocument
);
router.post(
  '/documents/:id/version',
  requireDocumentAccess('id'),
  authorize('admin', 'team_member'),
  upload.array('files', 1),
  documentsController.uploadNewVersion
);
router.post(
  '/documents/:id/sign',
  requireDocumentAccess('id'),
  validate(signDocumentSchema),
  documentsController.signDocument
);
router.delete(
  '/documents/:id',
  requireDocumentAccess('id'),
  authorize('admin'),
  documentsController.deleteDocument
);

export default router;
