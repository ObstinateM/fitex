import { Injectable } from '@nestjs/common';
import { db } from '../db/index.js';
import {
  creditBalance,
  creditTransaction,
  subscription,
} from '../db/schema.js';
import { eq, sql, and, gt } from 'drizzle-orm';
import { randomUUID } from 'crypto';

@Injectable()
export class CreditService {
  async initializeCredits(userId: string): Promise<void> {
    const existing = await db
      .select()
      .from(creditBalance)
      .where(eq(creditBalance.userId, userId))
      .limit(1);

    if (existing.length > 0) return;

    await db.insert(creditBalance).values({
      id: randomUUID(),
      userId,
      balance: '2',
    });

    await db.insert(creditTransaction).values({
      id: randomUUID(),
      userId,
      amount: '2',
      type: 'free',
      description: 'Welcome credits',
    });
  }

  async getBalance(userId: string): Promise<number> {
    // Lazy init — if no row exists, create one with free credits
    await this.initializeCredits(userId);

    const [row] = await db
      .select()
      .from(creditBalance)
      .where(eq(creditBalance.userId, userId))
      .limit(1);

    return Number(row.balance);
  }

  async addCredits(
    userId: string,
    amount: number,
    type: string,
    description: string,
    stripeSessionId?: string,
  ): Promise<void> {
    await this.initializeCredits(userId);

    await db
      .update(creditBalance)
      .set({
        balance: sql`${creditBalance.balance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(creditBalance.userId, userId));

    await db.insert(creditTransaction).values({
      id: randomUUID(),
      userId,
      amount: String(amount),
      type,
      description,
      stripeSessionId: stripeSessionId ?? null,
    });
  }

  async consumeCredits(
    userId: string,
    amount: number,
    description: string,
  ): Promise<boolean> {
    // Atomic: only deduct if balance is sufficient
    const result = await db
      .update(creditBalance)
      .set({
        balance: sql`${creditBalance.balance} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(creditBalance.userId, userId),
          sql`${creditBalance.balance} >= ${amount}`,
        ),
      )
      .returning();

    if (result.length === 0) return false;

    await db.insert(creditTransaction).values({
      id: randomUUID(),
      userId,
      amount: String(-amount),
      type: 'consumption',
      description,
    });

    return true;
  }

  async hasUnlimitedAccess(userId: string): Promise<{
    unlimited: boolean;
    expiresAt: Date | null;
  }> {
    const [sub] = await db
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.userId, userId),
          eq(subscription.status, 'active'),
          gt(subscription.currentPeriodEnd, new Date()),
        ),
      )
      .limit(1);

    return sub
      ? { unlimited: true, expiresAt: sub.currentPeriodEnd }
      : { unlimited: false, expiresAt: null };
  }

  async canPerformAction(
    userId: string,
    creditCost: number,
  ): Promise<boolean> {
    const { unlimited } = await this.hasUnlimitedAccess(userId);
    if (unlimited) return true;

    const balance = await this.getBalance(userId);
    return balance >= creditCost;
  }

  async getHistory(userId: string) {
    return db
      .select()
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, userId))
      .orderBy(sql`${creditTransaction.createdAt} DESC`);
  }
}
