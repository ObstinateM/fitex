import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CreditService } from './credit.service.js';
import type { Request } from 'express';

@Controller('credits')
@UseGuards(AuthGuard)
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Get('balance')
  async getBalance(@Req() req: Request) {
    const userId = (req as any).user.id;
    const balance = await this.creditService.getBalance(userId);
    const { unlimited, expiresAt } =
      await this.creditService.hasUnlimitedAccess(userId);

    return {
      balance,
      isUnlimited: unlimited,
      unlimitedExpiresAt: expiresAt,
    };
  }

  @Get('history')
  async getHistory(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.creditService.getHistory(userId);
  }
}
