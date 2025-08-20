import { Product, ProductStatus } from '../../enterprise/entities/product'
import { ProductDetails } from '../../enterprise/entities/value-objects/product-details'

import { PaginationParams } from '@/core/repositories/pagination-params'

export interface FindManyByOwner {
  ownerId: string
  search?: string
  status?: ProductStatus
}

export interface FindMany extends PaginationParams {
  search?: string
  status?: ProductStatus
}

export interface Count {
  sellerId: string
  status?: ProductStatus
}

export abstract class ProductsRepository {
  abstract count(params: Count): Promise<number>
  abstract findById(id: string): Promise<ProductDetails | null>
  abstract findManyByOwner(params: FindManyByOwner): Promise<ProductDetails[]>
  abstract findManyRecent(params: FindMany): Promise<ProductDetails[]>
  abstract create(product: Product): Promise<ProductDetails>
  abstract save(product: Product): Promise<ProductDetails>
}
