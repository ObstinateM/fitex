import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { CvModule } from './cv/cv.module.js';
import { StoryModule } from './story/story.module.js';
import { StripeModule } from './stripe/stripe.module.js';
import { CreditModule } from './credit/credit.module.js';
import { EmailModule } from './email/email.module.js';
import { ImageModule } from './image/image.module.js';
import { PostHogModule } from './posthog/posthog.module.js';
import { DebugController } from './debug/debug.controller.js';

@Module({
  imports: [AuthModule, CvModule, StoryModule, StripeModule, CreditModule, EmailModule, ImageModule, PostHogModule],
  controllers: [AppController, DebugController],
  providers: [AppService],
})
export class AppModule {}
