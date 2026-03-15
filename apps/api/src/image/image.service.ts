import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { cvImage } from '../db/schema.js';
import { StorageProvider } from './storage/storage.provider.js';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];
const MAX_IMAGES_PER_USER = 10;

@Injectable()
export class ImageService {
  constructor(private readonly storage: StorageProvider) {}

  async upload(
    userId: string,
    file: Express.Multer.File,
    label?: string,
  ) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported image type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    const existing = await db
      .select()
      .from(cvImage)
      .where(eq(cvImage.userId, userId));

    if (existing.length >= MAX_IMAGES_PER_USER) {
      throw new BadRequestException(
        `Maximum of ${MAX_IMAGES_PER_USER} images allowed`,
      );
    }

    const id = crypto.randomUUID();
    const ext = file.originalname.split('.').pop() ?? 'jpg';
    const storageFilename = `${id}.${ext}`;

    const stored = await this.storage.save(userId, storageFilename, file.buffer);

    await db.insert(cvImage).values({
      id,
      userId,
      originalFilename: file.originalname,
      storagePath: stored.path,
      mimeType: file.mimetype,
      label: label ?? null,
      sizeBytes: file.size,
    });

    return {
      id,
      originalFilename: file.originalname,
      label: label ?? null,
      url: stored.url,
    };
  }

  async list(userId: string) {
    const images = await db
      .select()
      .from(cvImage)
      .where(eq(cvImage.userId, userId));

    return images.map((img) => ({
      id: img.id,
      originalFilename: img.originalFilename,
      label: img.label,
      url: this.storage.getUrl(img.storagePath),
      createdAt: img.createdAt,
    }));
  }

  async getFile(userId: string, imageId: string) {
    const [image] = await db
      .select()
      .from(cvImage)
      .where(and(eq(cvImage.id, imageId), eq(cvImage.userId, userId)));

    if (!image) throw new NotFoundException('Image not found');

    const buffer = await this.storage.get(image.storagePath);
    return { buffer, mimeType: image.mimeType, filename: image.originalFilename };
  }

  async rename(userId: string, imageId: string, newFilename: string) {
    const [image] = await db
      .select()
      .from(cvImage)
      .where(and(eq(cvImage.id, imageId), eq(cvImage.userId, userId)));

    if (!image) throw new NotFoundException('Image not found');

    const trimmed = newFilename.trim();
    if (!trimmed) throw new BadRequestException('Filename cannot be empty');

    await db
      .update(cvImage)
      .set({ originalFilename: trimmed })
      .where(and(eq(cvImage.id, imageId), eq(cvImage.userId, userId)));

    return {
      id: image.id,
      originalFilename: trimmed,
      label: image.label,
      url: this.storage.getUrl(image.storagePath),
    };
  }

  async remove(userId: string, imageId: string) {
    const [image] = await db
      .select()
      .from(cvImage)
      .where(and(eq(cvImage.id, imageId), eq(cvImage.userId, userId)));

    if (!image) throw new NotFoundException('Image not found');

    await this.storage.delete(image.storagePath);
    await db
      .delete(cvImage)
      .where(and(eq(cvImage.id, imageId), eq(cvImage.userId, userId)));

    return { ok: true };
  }

  /** Returns all images for a user as { filename, buffer } pairs for LaTeX compilation */
  async getImagesForCompilation(userId: string) {
    const images = await db
      .select()
      .from(cvImage)
      .where(eq(cvImage.userId, userId));

    return Promise.all(
      images.map(async (img) => {
        const buffer = await this.storage.get(img.storagePath);
        return {
          filename: img.originalFilename,
          buffer,
        };
      }),
    );
  }
}
