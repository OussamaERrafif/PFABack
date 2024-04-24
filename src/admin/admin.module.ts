import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Admin } from './admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admin])], // Add this line to import TypeOrmModule and specify the entity
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService], // If you want to export AdminService to be used in other modules
})
export class AdminModule {}
