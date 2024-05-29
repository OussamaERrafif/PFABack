/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingDTO } from './DTO/billing.dto';
import { Billing } from './Entity/billing.entity';

@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}
  @Post()
  createBilling(@Body() billing: BillingDTO ,req : Express.Request): Promise<Billing> {
    return this.billingService.createBilling(req,billing);
  }

  @Get()
  getBillings(): Promise<Billing[]> {
    return this.billingService.getBillings();
  }

  @Delete(':username')
  deleteBilling(@Param('username') username: string) {
    return this.billingService.deleteBilling(username);
  }

  @Get('/byuser')
  getBilling(@Req() req : Express.Request): Promise<Billing[]> {
    return this.billingService.getBilling(req);
  }

  @Post()
  updateBilling(
    @Req() req: Express.Request,
    @Body() billing: BillingDTO,
  ): Promise<Billing> {
    try {
      return this.billingService.updateBilling(req, billing);
    } catch (error) {
      return error;
    }
  }
}
