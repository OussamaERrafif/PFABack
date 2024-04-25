import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DbConnectionService } from './app.DbConnectionService';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,private dbConnectionService: DbConnectionService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('DB')
  async checkConnection(): Promise<string> {
    const isConnected = await this.dbConnectionService.isConnected();
    return isConnected ? 'Connected to the database' : 'Not connected to the database';
  }
}
