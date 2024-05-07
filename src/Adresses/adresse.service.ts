import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Address } from './Entity/adress.entity';
import { Repository } from 'typeorm';
import { AddressDTO } from './DTO/adress.dto';

@Injectable()
export class AdresseService {
    constructor(
        // @InjectRepository(User)
        // private usersRepository: Repository<User>,
        @InjectRepository(Address)
        private addressRepository: Repository<Address>,
    ) {}

    async create(req: Express.Request , adressepayload : AddressDTO) {
        const newAddress = this.addressRepository.create({
            username: (req.user as User).username,
            street: adressepayload.street,
            city: adressepayload.city,
            state: adressepayload.state,
            postalCode: adressepayload.postalCode,
            
            
        });
    
        await this.addressRepository.save(newAddress);
    }

    

    async get(req: Express.Request) {
        const address = await this.addressRepository.findOne({
            where: { username: (req.user as User).username },
        });
        console.log(address)
        return address;
    }

    async update(req: Express.Request, adressepayload: AddressDTO) {
        const address = await this.addressRepository.findOne({
            where: { username: (req.user as User).username },
        });

        address.street = adressepayload.street;
        address.city = adressepayload.city;
        address.state = adressepayload.state;
        address.postalCode = adressepayload.postalCode;

        await this.addressRepository.save(address);
    }
}
