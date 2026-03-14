import {
  Controller,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { cvTemplate, pdfConversionLog, user } from '../db/schema.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('debug')
@UseGuards(AuthGuard)
export class DebugController {
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
}
