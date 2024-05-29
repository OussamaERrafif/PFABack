/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { BillingDTO } from './DTO/billing.dto';
import { Billing } from './Entity/billing.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Await } from 'react-router-dom';

@Injectable()
export class BillingService {
  constructor(
    // Injecting the BillingRepository
    @InjectRepository(Billing)
    private billingRepository: Repository<Billing>,
  ) {}

  //   async create(req: Express.Request, adressepayload: AddressDTO) {
  //     const newAddress = this.addressRepository.create({
  //       username: (req.user as User).username,
  //       street: adressepayload.street,
  //       city: adressepayload.city,
  //       state: adressepayload.state,
  //       postalCode: adressepayload.postalCode,
  //     });

  //     await this.addressRepository.save(newAddress);
  //   }
  //create a new billing
  createBilling(billing: BillingDTO): Promise<Billing> {
    const newBilling = this.billingRepository.create({
      username: billing.username,
      CardNumber: billing.cardNumber,
      CardHolder: billing.cardHolder,
      ExpirationDate: billing.expirationDate,
      CVC: billing.cvc,
    });
    return this.billingRepository.save(newBilling);
  }

  //update a billing
async updateBilling(username: string, billing: BillingDTO): Promise<Billing> {
    try {
        const existingBilling = await this.billingRepository.findOne({ where: { username } });
        if (!existingBilling) {
            const newBilling = this.billingRepository.create({
                username: billing.username,
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
  getBilling(username: string): Promise<Billing[]> {
    return this.billingRepository.find({ where: { username } });
  }
}
