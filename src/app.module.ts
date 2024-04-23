import { UserModule } from './user/user.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbConnectionService } from './app.DbConnectionService';

@Module({
  imports: [
    UserModule,
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'PFA',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // set to false
      dropSchema: false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, DbConnectionService],
})
export class AppModule {}
