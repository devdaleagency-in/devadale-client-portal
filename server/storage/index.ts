import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { config } from '../config';

interface StorageProvider {
  upload(fileName: string, buffer: Buffer, mimeType: string): Promise<string>;
  download(fileName: string): Promise<Buffer>;
  delete(fileName: string): Promise<void>;
  getSignedUrl(fileName: string, expiresIn?: number): Promise<string>;
}

class LocalStorage implements StorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = config.storage.localDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async upload(fileName: string, buffer: Buffer, _mimeType: string): Promise<string> {
    const filePath = path.join(this.baseDir, fileName);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${fileName}`;
  }

  async download(fileName: string): Promise<Buffer> {
    return fs.readFileSync(path.join(this.baseDir, fileName));
  }

  async delete(fileName: string): Promise<void> {
    const filePath = path.join(this.baseDir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async getSignedUrl(fileName: string, _expiresIn?: number): Promise<string> {
    return `/uploads/${fileName}`;
  }
}

class S3Storage implements StorageProvider {
  async upload(_fileName: string, _buffer: Buffer, _mimeType: string): Promise<string> {
    throw new Error('S3 not configured. Set STORAGE_PROVIDER=s3 and S3_* env vars.');
  }

  async download(_fileName: string): Promise<Buffer> {
    throw new Error('S3 not configured.');
  }

  async delete(_fileName: string): Promise<void> {
    throw new Error('S3 not configured.');
  }

  async getSignedUrl(fileName: string, _expiresIn?: number): Promise<string> {
    throw new Error(`S3 not configured. Cannot generate URL for ${fileName}`);
  }
}

function createStorageProvider(): StorageProvider {
  switch (config.storage.provider) {
    case 's3':
      return new S3Storage();
    case 'local':
    default:
      return new LocalStorage();
  }
}

export const storage = createStorageProvider();

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  prefix = 'uploads'
): Promise<{ url: string; key: string }> {
  const ext = path.extname(originalName);
  const key = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const url = await storage.upload(key, buffer, mimeType);
  return { url, key };
}

export async function getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
  return storage.getSignedUrl(key, expiresIn);
}
