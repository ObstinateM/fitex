import { Module } from '@nestjs/common';
import { CreditModule } from '../credit/credit.module.js';
import { EmailModule } from '../email/email.module.js';
import { StripeService } from './stripe.service.js';
import { StripeController } from './stripe.controller.js';
import { StripeWebhookController } from './stripe-webhook.controller.js';

@Module({
  imports: [CreditModule, EmailModule],
  controllers: [StripeController, StripeWebhookController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
