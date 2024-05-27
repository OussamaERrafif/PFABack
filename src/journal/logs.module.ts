import { LogsController } from './logs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logs } from './entity/logs.entity';
import { LogsService } from './logs.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([Logs])],
  controllers: [LogsController],
  providers: [LogsService],
})
export class LogsModule {

  


}
