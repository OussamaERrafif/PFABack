/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get } from '@nestjs/common';
import { LogsService } from './logs.service';

@Controller('logs')
export class LogsController {
    constructor(private logsservice : LogsService) {}

    //getall
    @Get()
    getall() {
        return this.logsservice.getall();
    }

}
