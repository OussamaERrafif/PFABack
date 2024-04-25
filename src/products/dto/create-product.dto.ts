// create-product.dto.ts

import { Category } from '../entities/category.enum';

export class CreateProductDto {
  readonly name: string;
  readonly category: Category;
  readonly brand: string;
  readonly quantity: number;
  readonly price: number;
}

//write a json exeample
// {
//   "name": "product1",
//   "category": "Electronics",
//   "brand": "Samsung",
//   "quantity": 10,
//   "price": 1000
// }
