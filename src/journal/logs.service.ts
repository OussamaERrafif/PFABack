/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { Logs } from './entity/logs.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LogsService {

    constructor(
        @InjectRepository(Logs)
        private logsRepository: Repository<Logs>,
    ) {}

    async createLog(user: string, type: string, description: string, status: string): Promise<Logs> {
        const log = this.logsRepository.create({ user, type, description, status });
        return this.logsRepository.save(log);
    }

    async getall(): Promise<Logs[]> {
        return this.logsRepository.find();
    }

}
