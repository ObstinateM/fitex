import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { CvModule } from './cv/cv.module.js';
import { StoryModule } from './story/story.module.js';
import { DebugController } from './debug/debug.controller.js';

@Module({
  imports: [AuthModule, CvModule, StoryModule],
  controllers: [AppController, DebugController],
  providers: [AppService],
})
export class AppModule {}
