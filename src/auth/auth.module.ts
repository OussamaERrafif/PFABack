import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategies';
import { JwtStrategy } from './strategies/jwt.strategies';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Employee } from 'src/user/employee/employee.entity';
import { EmployeeModule } from 'src/user/employee/employee.module';
import { Token } from 'src/user/token.entity';
import { TokenModule } from 'src/user/token.module';
import { AdminModule } from 'src/admin/admin.module';
import { Admin } from 'src/admin/admin.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1h' }
    }),TypeOrmModule.forFeature([User,Employee,Token,Admin]), 
    UserModule,EmployeeModule,TokenModule,AdminModule
  ],
  controllers: [AuthController],
  providers: [AuthService,LocalStrategy,JwtStrategy]
})
export class AuthModule {}
