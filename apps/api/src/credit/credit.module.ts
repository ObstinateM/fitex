import { Module } from '@nestjs/common';
import { CreditService } from './credit.service.js';
import { CreditController } from './credit.controller.js';

@Module({
  controllers: [CreditController],
  providers: [CreditService],
  exports: [CreditService],
})
export class CreditModule {}
