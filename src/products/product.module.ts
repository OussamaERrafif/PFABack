import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service'; 
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logs } from 'src/journal/entity/logs.entity';
import { LogsService } from 'src/journal/logs.service';


@Module({
  imports: [TypeOrmModule.forFeature([Product,Logs])],
  controllers: [ProductController],
  providers: [ProductService,LogsService], 

})
export class ProductModule {}
