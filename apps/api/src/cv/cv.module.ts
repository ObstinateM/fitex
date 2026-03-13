import { Module } from '@nestjs/common';
import { CvController } from './cv.controller.js';
import { CvService } from './cv.service.js';
import { AIModule } from '../ai/ai.module.js';

@Module({
  imports: [AIModule],
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule {}
