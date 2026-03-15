export interface StoredFile {
  path: string;
  url: string;
}

export abstract class StorageProvider {
  abstract save(
    userId: string,
    filename: string,
    buffer: Buffer,
  ): Promise<StoredFile>;

  abstract get(storagePath: string): Promise<Buffer>;

  abstract delete(storagePath: string): Promise<void>;

  abstract getUrl(storagePath: string): string;
}
