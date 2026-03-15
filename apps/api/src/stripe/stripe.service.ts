import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { db } from '../db/index.js';
import { user } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const PRICE_MAP: Record<string, { priceId: string; credits: number | null }> = {
  starter: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    credits: 15,
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    credits: 40,
  },
  unlimited: {
    priceId: process.env.STRIPE_UNLIMITED_PRICE_ID!,
    credits: null,
  },
};

@Injectable()
export class StripeService {
  public stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  async ensureCustomer(
    userId: string,
    email: string,
    name: string,
  ): Promise<string> {
    const [existingUser] = await db
      .select({ stripeCustomerId: user.stripeCustomerId })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser?.stripeCustomerId) {
      return existingUser.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: { userId },
    });

    await db
      .update(user)
      .set({ stripeCustomerId: customer.id })
      .where(eq(user.id, userId));

    return customer.id;
  }

  async createCheckoutSession(
    userId: string,
    email: string,
    name: string,
    priceType: 'starter' | 'pro' | 'unlimited',
  ) {
    const config = PRICE_MAP[priceType];
    if (!config) throw new Error(`Unknown price type: ${priceType}`);

    const customerId = await this.ensureCustomer(userId, email, name);
    const isSubscription = priceType === 'unlimited';
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: isSubscription ? 'subscription' : 'payment',
      ui_mode: 'embedded',
      line_items: [{ price: config.priceId, quantity: 1 }],
      metadata: {
        userId,
        productType: priceType,
        credits: config.credits?.toString() ?? 'unlimited',
      },
      return_url: `${frontendUrl}/settings/billing/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return { clientSecret: session.client_secret };
  }

  async createPortalSession(stripeCustomerId: string) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    const portalSession = await this.stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${frontendUrl}/settings/billing`,
    });

    return { url: portalSession.url };
  }

  async getInvoices(stripeCustomerId: string) {
    const invoices = await this.stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 50,
    });

    return invoices.data.map((inv) => ({
      id: inv.id,
      amount: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      date: inv.created,
      invoiceUrl: inv.hosted_invoice_url,
      pdfUrl: inv.invoice_pdf,
    }));
  }
}
