import { Controller, Post, Req, Res, HttpCode } from '@nestjs/common';
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { StripeService } from './stripe.service.js';
import { CreditService } from '../credit/credit.service.js';
import { EmailService } from '../email/email.service.js';
import { db } from '../db/index.js';
import { payment, subscription } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

@Controller('stripe')
export class StripeWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly creditService: CreditService,
    private readonly emailService: EmailService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      event = this.stripeService.stripe.webhooks.constructEvent(
        (req as any).rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice,
        );
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;
    }

    return res.json({ received: true });
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const productType = session.metadata?.productType;
    const credits = session.metadata?.credits;

    if (!userId || !productType) return;

    // Idempotency check
    const existing = await db
      .select()
      .from(payment)
      .where(eq(payment.stripeSessionId, session.id))
      .limit(1);

    if (existing.length > 0) return;

    if (productType === 'unlimited') {
      // Create subscription record — the actual subscription data
      // comes from the subscription events, but we record the payment
      const sub = await this.stripeService.stripe.subscriptions.retrieve(
        session.subscription as string,
      );

      await db
        .insert(subscription)
        .values({
          id: randomUUID(),
          userId,
          stripeSubscriptionId: sub.id,
          stripeCustomerId: session.customer as string,
          status: 'active',
          currentPeriodEnd: new Date(sub.items.data[0].current_period_end * 1000),
        })
        .onConflictDoUpdate({
          target: subscription.userId,
          set: {
            stripeSubscriptionId: sub.id,
            status: 'active',
            currentPeriodEnd: new Date(sub.items.data[0].current_period_end * 1000),
          },
        });
    } else if (credits && credits !== 'unlimited') {
      // Credit pack purchase
      const creditAmount = parseInt(credits, 10);
      await this.creditService.addCredits(
        userId,
        creditAmount,
        'purchase',
        `${productType.charAt(0).toUpperCase() + productType.slice(1)} Pack purchase`,
        session.id,
      );
    }

    // Record payment
    await db.insert(payment).values({
      id: randomUUID(),
      userId,
      stripeSessionId: session.id,
      amount: session.amount_total ?? 0,
      status: 'completed',
      productType,
      creditsAdded:
        credits && credits !== 'unlimited' ? parseInt(credits, 10) : null,
    });
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    // Send receipt email for subscription renewals
    if (!invoice.customer_email) return;

    await this.emailService.sendPaymentReceipt(invoice.customer_email, {
      amount: invoice.amount_paid,
      productType: 'unlimited',
      credits: null,
      date: new Date(invoice.created * 1000),
      invoiceUrl: invoice.hosted_invoice_url ?? null,
    });
  }

  private async handleSubscriptionUpdated(sub: Stripe.Subscription) {
    await db
      .update(subscription)
      .set({
        status: sub.status === 'active' ? 'active' : 'past_due',
        currentPeriodEnd: new Date(sub.items.data[0].current_period_end * 1000),
      })
      .where(eq(subscription.stripeSubscriptionId, sub.id));
  }

  private async handleSubscriptionDeleted(sub: Stripe.Subscription) {
    await db
      .update(subscription)
      .set({ status: 'canceled' })
      .where(eq(subscription.stripeSubscriptionId, sub.id));
  }
}
