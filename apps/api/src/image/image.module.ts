import { Module } from '@nestjs/common';
import { ImageController } from './image.controller.js';
import { ImageService } from './image.service.js';
import { StorageProvider } from './storage/storage.provider.js';
import { DiskStorageProvider } from './storage/disk-storage.provider.js';

@Module({
  controllers: [ImageController],
  providers: [
    ImageService,
    { provide: StorageProvider, useClass: DiskStorageProvider },
  ],
  exports: [ImageService],
})
export class ImageModule {}
