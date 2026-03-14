import { Module } from '@nestjs/common';
import { StoryController } from './story.controller.js';
import { StoryService } from './story.service.js';
import { AIModule } from '../ai/ai.module.js';

@Module({
  imports: [AIModule],
  controllers: [StoryController],
  providers: [StoryService],
})
export class StoryModule {}
