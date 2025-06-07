import { PaginationParams } from '@/core/repositories/pagination-params'

import { Product, ProductStatus } from '../../enterprise/entities/product'

export interface FindMany extends PaginationParams {
  search?: string
  status?: ProductStatus
}

export abstract class ProductsRepository {
  abstract findById(id: string): Promise<Product | null>
  abstract findManyRecent(params: FindMany): Promise<Product[]>
  abstract create(product: Product): Promise<void>
  abstract save(product: Product): Promise<void>
}
