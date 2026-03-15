import { Injectable } from '@nestjs/common';
import { StorageProvider, type StoredFile } from './storage.provider.js';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads';

@Injectable()
export class DiskStorageProvider extends StorageProvider {
  async save(
    userId: string,
    filename: string,
    buffer: Buffer,
  ): Promise<StoredFile> {
    const dir = path.join(UPLOAD_DIR, userId);
    await fs.mkdir(dir, { recursive: true });

    const storagePath = path.join(userId, filename);
    const fullPath = path.join(UPLOAD_DIR, storagePath);
    await fs.writeFile(fullPath, buffer);

    return { path: storagePath, url: this.getUrl(storagePath) };
  }

  async get(storagePath: string): Promise<Buffer> {
    const fullPath = path.join(UPLOAD_DIR, storagePath);
    return fs.readFile(fullPath);
  }

  async delete(storagePath: string): Promise<void> {
    const fullPath = path.join(UPLOAD_DIR, storagePath);
    await fs.unlink(fullPath).catch(() => {});
  }

  getUrl(storagePath: string): string {
    return `/image/file/${storagePath}`;
  }
}
