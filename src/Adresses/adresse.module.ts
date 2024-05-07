/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { AdresseController } from './adresse.controller';
import { AdresseService } from './adresse.service';
import { Address } from './Entity/adress.entity';
import { User } from 'src/user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Address,User])],
    controllers: [AdresseController],
    providers: [AdresseService],
})
export class AdresseModule {}
