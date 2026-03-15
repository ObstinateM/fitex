import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CreditService } from './credit.service.js';
import type { Request } from 'express';

export const CREDIT_COST_KEY = 'creditCost';
export const CreditCost = (cost: number) =>
  SetMetadata(CREDIT_COST_KEY, cost);

@Injectable()
export class CreditGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly creditService: CreditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const cost = this.reflector.getAllAndOverride<number>(CREDIT_COST_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (cost === undefined || cost === null) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const userId = (req as any).user?.id;
    if (!userId) return false;

    const canProceed = await this.creditService.canPerformAction(userId, cost);
    if (!canProceed) {
      const { HttpException, HttpStatus } = await import('@nestjs/common');
      throw new HttpException(
        'Insufficient credits',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    return true;
  }
}
