import { TokenModule } from './user/token.module';
// Importing necessary modules and components from NestJS
import { UserModule } from './user/user.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbConnectionService } from './app.DbConnectionService';
import { ProductModule } from './products/product.module';

@Module({
  // Declaring the AppModule class
  imports: [
    TokenModule,
    // Importing the UserModule to use its functionality
    ProductModule,
    // Importing the ProductModule to use its functionality
    UserModule,
    // Importing the AuthModule to use its functionality
    AuthModule,
    // Setting up TypeORM for database connection
    TypeOrmModule.forRoot({
      // Using MySQL as the database type
      type: 'mysql',
      // Database host
      host: 'localhost',
      // Database port
      port: 3306,
      // Database username
      username: 'root',
      // Database password (empty for now, should be secured in production)
      password: '',
      // Database name
      database: 'PFA',
      // Entities to be used for database operations (both .ts and .js files)
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // Whether to auto-create the database schema (set to false for production)
      synchronize: false,
      // Whether to drop the schema and recreate it on every application start (set to false for production)
      dropSchema: false,
    }),
  ],
  // Declaring controllers used in this module
  controllers: [AppController],
  // Declaring providers used in this module
  providers: [AppService, DbConnectionService],
})
// Exporting the AppModule class
export class AppModule {}
