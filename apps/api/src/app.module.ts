import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { CvModule } from './cv/cv.module.js';
import { DebugController } from './debug/debug.controller.js';

@Module({
  imports: [AuthModule, CvModule],
  controllers: [AppController, DebugController],
  providers: [AppService],
})
export class AppModule {}
