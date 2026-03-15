import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PostHog } from 'posthog-node';

@Injectable()
export class PostHogService implements OnModuleDestroy {
  private client: PostHog | null = null;

  constructor() {
    const apiKey = process.env.POSTHOG_API_KEY;
    if (apiKey) {
      this.client = new PostHog(apiKey, {
        host: process.env.POSTHOG_HOST ?? 'https://us.i.posthog.com',
      });
    }
  }

  capture(distinctId: string, event: string, properties?: Record<string, unknown>) {
    this.client?.capture({ distinctId, event, properties });
  }

  identify(distinctId: string, properties?: Record<string, unknown>) {
    this.client?.identify({ distinctId, properties });
  }

  async onModuleDestroy() {
    await this.client?.shutdown();
  }
}
