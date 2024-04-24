// product.entity.ts

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from './category.enum';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  category: Category;

  @Column()
  brand: string;

  @Column()
  quantity: number;

  @Column()
  price: number;
}
