import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Admin } from './admin.entity';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/user/user.entity';
import { Token } from 'src/user/token.entity';
import { Employee } from 'src/user/employee/employee.entity';
import { JwtModule } from '@nestjs/jwt';
import { Address } from 'src/Adresses/Entity/adress.entity';
import { LogsService } from 'src/journal/logs.service';
import { Logs } from 'src/journal/entity/logs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, User, Token, Employee,Address,Logs]),
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1h' },
    }),
  ], // Add this line to import TypeOrmModule and specify the entity
  providers: [AdminService, AuthService,LogsService],
  controllers: [AdminController],
  exports: [AdminService], // If you want to export AdminService to be used in other modules
})
export class AdminModule {}
