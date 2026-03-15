import { Global, Module } from '@nestjs/common';
import { PostHogService } from './posthog.service.js';

@Global()
@Module({
  providers: [PostHogService],
  exports: [PostHogService],
})
export class PostHogModule {}
