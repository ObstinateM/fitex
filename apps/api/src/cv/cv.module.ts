import { Module } from '@nestjs/common';
import { CvController } from './cv.controller.js';
import { CvService } from './cv.service.js';
import { AIModule } from '../ai/ai.module.js';
import { ImageModule } from '../image/image.module.js';

@Module({
  imports: [AIModule, ImageModule],
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule {}
