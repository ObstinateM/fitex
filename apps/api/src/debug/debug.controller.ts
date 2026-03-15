import {
  Controller,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  cvTemplate,
  pdfConversionLog,
  user,
  payment,
  subscription,
} from '../db/schema.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CreditService } from '../credit/credit.service.js';
import { randomUUID } from 'crypto';

@Controller('debug')
@UseGuards(AuthGuard)
export class DebugController {
  constructor(private readonly creditService: CreditService) {}

  private assertDev() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Debug endpoints are disabled in production');
    }
  }

  @Post('reset-onboarding')
  async resetOnboarding(@Req() req: any) {
    this.assertDev();
    const userId = req.user.id;
    await db.delete(cvTemplate).where(eq(cvTemplate.userId, userId));
    await db.update(user).set({ isOnboarded: false }).where(eq(user.id, userId));
    return { ok: true };
  }

  @Post('reset-pdf-quota')
  async resetPdfQuota(@Req() req: any) {
    this.assertDev();
    const userId = req.user.id;
    await db.delete(pdfConversionLog).where(eq(pdfConversionLog.userId, userId));
    return { ok: true };
  }

  @Post('add-credits')
  async addCredits(@Req() req: any) {
    this.assertDev();
    const userId = req.user.id;
    const sessionId = `debug_${randomUUID()}`;

    await this.creditService.addCredits(
      userId,
      10,
      'purchase',
      'Debug — 10 credits added',
      sessionId,
    );

    await db.insert(payment).values({
      id: randomUUID(),
      userId,
      stripeSessionId: sessionId,
      amount: 0,
      status: 'completed',
      productType: 'debug',
      creditsAdded: 10,
    });

    return { ok: true };
  }

  @Post('expire-subscription')
  async expireSubscription(@Req() req: any) {
    this.assertDev();
    const userId = req.user.id;

    await db
      .update(subscription)
      .set({
        status: 'canceled',
        currentPeriodEnd: new Date(),
      })
      .where(eq(subscription.userId, userId));

    return { ok: true };
  }
}
