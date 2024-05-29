/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { BillingDTO } from './DTO/billing.dto';
import { Billing } from './Entity/billing.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';

@Injectable()
export class BillingService {
  constructor(
    // Injecting the BillingRepository
    @InjectRepository(Billing)
    private billingRepository: Repository<Billing>,
  ) {}

  //create a new billing
  createBilling(req: Express.Request, billing: BillingDTO): Promise<Billing> {
    const newBilling = this.billingRepository.create({
      username: (req.user as User).username,
      CardNumber: billing.cardNumber,
      CardHolder: billing.cardHolder,
      ExpirationDate: billing.expirationDate,
      CVC: billing.cvc,
    });
    return this.billingRepository.save(newBilling);
  }

  //update a billing
  async updateBilling(
    req: Express.Request,
    billing: BillingDTO,
  ): Promise<Billing> {
    try {
      const existingBilling = await this.billingRepository.findOne({
        where: { username: (req.user as User).username },
      });
      if (!existingBilling) {
        const newBilling = this.billingRepository.create({
          username: (req.user as User).username,
          CardNumber: billing.cardNumber,
          CardHolder: billing.cardHolder,
          ExpirationDate: billing.expirationDate,
          CVC: billing.cvc,
        });
        return this.billingRepository.save(newBilling);
      } else {
        existingBilling.CardNumber = billing.cardNumber;
        existingBilling.CardHolder = billing.cardHolder;
        existingBilling.ExpirationDate = billing.expirationDate;
        existingBilling.CVC = billing.cvc;

        return this.billingRepository.save(existingBilling);
      }
    } catch (error) {
      return error;
    }
  }

  //get all billings
  getBillings(): Promise<Billing[]> {
    return this.billingRepository.find();
  }

  //delete a billing
  deleteBilling(username: string) {
    this.billingRepository.delete(username);
  }

  //get a billing by username
  getBilling(req: Express.Request): Promise<Billing[]> {
    return this.billingRepository.find({
      where: { username: (req.user as User).username },
    });
  }
}
