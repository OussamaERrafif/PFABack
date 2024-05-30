/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { LogsService } from 'src/journal/logs.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private logsservice : LogsService
  ) {}

  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id: id } });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    this.validateProductInput(createProductDto.quantity, createProductDto.price);
    const product = this.productRepository.create(createProductDto);
    
    this.logsservice.createLog('user', 'create', 'create product', 'success')
    return await this.productRepository.save(product);
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    this.validateProductInput(updateProductDto.quantity, updateProductDto.price);
    const product = await this.productRepository.findOne({ where: { id: id } });
    if (!product) {
      this.logsservice.createLog('user', 'update', 'update product', 'failed')
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    const updatedProduct = { ...product, ...updateProductDto };
    this.logsservice.createLog('user', 'update', 'update product', 'success')
    return await this.productRepository.save(updatedProduct);
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await this.getProductById(id);
    this.logsservice.createLog('user', 'delete', 'delete product', 'success')
    await this.productRepository.remove(product);
  }
  private validateProductInput(quantity: number, price: number): void {
    if (quantity < 0) {
        throw new BadRequestException('Quantity must be greater than or equal to 0');
    }
    if (price < 0) {
        throw new BadRequestException('Price must be greater than or equal to 0');
    }}
}
