/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingDTO } from './DTO/billing.dto';
import { Billing } from './Entity/billing.entity';

@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}
  @Post()
  createBilling(@Body() billing: BillingDTO): Promise<Billing> {
    return this.billingService.createBilling(billing);
  }

  @Get()
  getBillings(): Promise<Billing[]> {
    return this.billingService.getBillings();
  }

  @Delete(':username')
  deleteBilling(@Param('username') username: string) {
    return this.billingService.deleteBilling(username);
  }

  @Get(':username')
  getBilling(@Param('username') username: string): Promise<Billing[]> {
    return this.billingService.getBilling(username);
  }

  @Post(':username')
  updateBilling(
    @Param('username') username: string,
    @Body() billing: BillingDTO,
  ): Promise<Billing> {
    try {
      return this.billingService.updateBilling(username, billing);
    } catch (error) {
      return error;
    }
  }
}
