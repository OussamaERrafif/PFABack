import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';

@Injectable()
export class DbConnectionService {
  constructor(private connection: Connection) {}

  async isConnected(): Promise<boolean> {
    return this.connection.isConnected;
  }
}