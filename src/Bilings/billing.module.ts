import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingService } from './billing.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { Billing } from './Entity/billing.entity';
import { BillingController } from './billing.controller';

@Module({
  imports: [ TypeOrmModule.forFeature([Billing])],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
