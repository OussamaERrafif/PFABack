/* eslint-disable prettier/prettier */
// update-product.dto.ts

import { Category } from '../entities/category.enum';

export class UpdateProductDto {
  readonly name?: string;
  readonly category?: Category;
  readonly brand?: string;
  readonly quantity?: number;
  readonly price?: number;
}
