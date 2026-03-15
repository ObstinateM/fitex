import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { StripeService } from './stripe.service.js';
import { db } from '../db/index.js';
import { user, subscription, payment } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import type { Request } from 'express';

@Controller('stripe')
@UseGuards(AuthGuard)
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  async createCheckout(
    @Req() req: Request,
    @Body() body: { priceType: 'starter' | 'pro' | 'unlimited' },
  ) {
    const u = (req as any).user;
    return this.stripeService.createCheckoutSession(
      u.id,
      u.email,
      u.name,
      body.priceType,
    );
  }

  @Post('portal')
  async createPortal(@Req() req: Request) {
    const userId = (req as any).user.id;

    const [u] = await db
      .select({ stripeCustomerId: user.stripeCustomerId })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!u?.stripeCustomerId) {
      return { error: 'No Stripe customer found' };
    }

    return this.stripeService.createPortalSession(u.stripeCustomerId);
  }

  @Get('invoices')
  async getInvoices(@Req() req: Request) {
    const userId = (req as any).user.id;

    return db
      .select()
      .from(payment)
      .where(eq(payment.userId, userId))
      .orderBy(desc(payment.createdAt));
  }

  @Get('subscription')
  async getSubscription(@Req() req: Request) {
    const userId = (req as any).user.id;

    const [sub] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, userId))
      .limit(1);

    return sub ?? null;
  }
}
