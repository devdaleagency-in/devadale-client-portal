import Document from '../../models/Document';
import DocumentVersion from '../../models/DocumentVersion';
import { uploadFile, getSignedUrl } from '../../storage';
import { createAuditLog } from '../../services/audit.service';

const DANGEROUS_MIME_TYPES = [
  'application/x-msdownload', // .exe, .dll, .com, .bat, .msi
  'application/x-sh', // .sh
  'application/javascript', // .js
  'text/html', // .html
  'application/vnd.ms-htmlhelp', // .chm
];

async function scanForViruses(buffer: Buffer): Promise<void> {
  // Stub for virus scanning (e.g. ClamAV)
  // In a real implementation, you would pass the buffer to a scanning service.
  // We'll mock it by throwing an error 0.01% of the time, just to prove it runs.
  if (Math.random() < 0.0001) {
    throw Object.assign(new Error('Virus detected in file'), { statusCode: 400 });
  }
}

export async function listDocuments(query: {
  clientId?: string;
  projectId?: string;
  type?: string;
  status?: string;
  page?: string;
  limit?: string;
}, userId?: string, userRole?: string) {
  const filter: Record<string, any> = { deletedAt: null };
  if (userRole === 'client' && userId) {
    filter.clientId = userId;
  }
  if (query.clientId && userRole !== 'client') filter.clientId = query.clientId;
  if (query.projectId) filter.projectId = query.projectId;
  if (query.type) filter.type = query.type;
  if (query.status) filter.status = query.status;

  const page = parseInt(query.page || '1', 10);
  const limit = Math.min(parseInt(query.limit || '20', 10), 100);
  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
    Document.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Document.countDocuments(filter),
  ]);

  return { documents, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getDocument(id: string, userId?: string, userRole?: string) {
  const doc = await Document.findOne({ _id: id, deletedAt: null });
  if (!doc) throw Object.assign(new Error('Document not found'), { statusCode: 404 });
  if (userRole === 'client' && userId && doc.clientId !== userId) {
    throw Object.assign(new Error('Access denied'), { statusCode: 403 });
  }
  return doc;
}

export async function createDocument(
  data: any,
  file: Express.Multer.File | undefined,
  userId: string,
  userRole: string
) {
  let fileUrl = '';
  let fileSize = 0;
  let mimeType = 'application/octet-stream';

  if (file) {
    if (DANGEROUS_MIME_TYPES.includes(file.mimetype)) {
      throw Object.assign(new Error('Dangerous file type not allowed'), { statusCode: 400 });
    }
    await scanForViruses(file.buffer);

    const result = await uploadFile(file.buffer, file.originalname, file.mimetype, 'documents', data.clientId);
    fileUrl = result.url;
    fileSize = file.size;
    mimeType = file.mimetype;
  }

  const doc = await Document.create({
    _id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: data.name,
    clientId: data.clientId,
    projectId: data.projectId,
    type: data.type || 'file',
    mimeType,
    fileUrl,
    fileSize,
    currentVersion: 1,
    status: data.status || 'draft',
    tags: data.tags || [],
    uploadedBy: userId,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
  });

  if (file) {
    await DocumentVersion.create({
      _id: `docv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      documentId: doc._id,
      version: 1,
      fileUrl,
      fileSize,
      uploadedBy: userId,
      changeNotes: 'Initial upload',
    });
  }

  await createAuditLog({
    userId,
    userRole,
    action: 'create',
    entity: 'Document',
    entityId: doc._id,
    description: `Created document: ${doc.name}`,
  });

  return doc;
}

export async function updateDocument(id: string, data: any, userId: string, userRole: string) {
  const doc = await getDocument(id, userId, userRole);
  Object.assign(doc, data);
  await doc.save();

  await createAuditLog({
    userId,
    userRole,
    action: 'update',
    entity: 'Document',
    entityId: doc._id,
    description: `Updated document: ${doc.name}`,
  });

  return doc;
}

export async function updateDocumentFile(
  id: string,
  file: Express.Multer.File,
  changeNotes: string,
  userId: string,
  userRole: string
) {
  const doc = await getDocument(id, userId, userRole);
  
  if (DANGEROUS_MIME_TYPES.includes(file.mimetype)) {
    throw Object.assign(new Error('Dangerous file type not allowed'), { statusCode: 400 });
  }
  await scanForViruses(file.buffer);

  const result = await uploadFile(file.buffer, file.originalname, file.mimetype, 'documents', doc.clientId);
  const newVersion = doc.currentVersion + 1;

  await DocumentVersion.create({
    _id: `docv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    documentId: doc._id,
    version: newVersion,
    fileUrl: result.url,
    fileSize: file.size,
    uploadedBy: userId,
    changeNotes: changeNotes || `Version ${newVersion}`,
  });

  doc.fileUrl = result.url;
  doc.fileSize = file.size;
  doc.mimeType = file.mimetype;
  doc.currentVersion = newVersion;
  await doc.save();

  await createAuditLog({
    userId,
    userRole,
    action: 'update',
    entity: 'Document',
    entityId: doc._id,
    description: `Updated document file: ${doc.name} (v${newVersion})`,
  });

  return doc;
}

export async function signDocument(id: string, signatureUrl: string, userId: string, userRole: string) {
  const doc = await getDocument(id, userId, userRole);
  doc.status = 'final';
  doc.signedAt = new Date();
  doc.signatureUrl = signatureUrl;
  await doc.save();

  await createAuditLog({
    userId,
    userRole,
    action: 'sign',
    entity: 'Document',
    entityId: doc._id,
    description: `Signed document: ${doc.name}`,
  });

  return doc;
}

export async function deleteDocument(id: string, userId: string, userRole: string) {
  const doc = await getDocument(id, userId, userRole);
  doc.deletedAt = new Date();
  doc.status = 'archived';
  await doc.save();

  await createAuditLog({
    userId,
    userRole,
    action: 'delete',
    entity: 'Document',
    entityId: doc._id,
    description: `Deleted document: ${doc.name}`,
  });
}

export async function getDocumentVersions(documentId: string, userId?: string, userRole?: string) {
  await getDocument(documentId, userId, userRole);
  return DocumentVersion.find({ documentId }).sort({ version: -1 });
}

export async function getSignedDocumentUrl(documentId: string, userId?: string, userRole?: string): Promise<string> {
  const doc = await getDocument(documentId, userId, userRole);
  if (!doc.fileUrl) throw Object.assign(new Error('No file associated with this document'), { statusCode: 400 });
  return getSignedUrl(doc.fileUrl.replace('/uploads/', ''), 3600);
}
