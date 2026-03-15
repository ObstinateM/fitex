import { Module } from '@nestjs/common';
import { CvController } from './cv.controller.js';
import { CvService } from './cv.service.js';
import { AIModule } from '../ai/ai.module.js';
import { ImageModule } from '../image/image.module.js';
import { StoryModule } from '../story/story.module.js';

@Module({
  imports: [AIModule, ImageModule, StoryModule],
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule {}
