import { Product, ProductStatus } from '../../enterprise/entities/product'

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
  abstract count(params: Count): Promise<Product[]>
  abstract findById(id: string): Promise<Product | null>
  abstract findManyByOwner(params: FindManyByOwner): Promise<Product[]>
  abstract findManyRecent(params: FindMany): Promise<Product[]>
  abstract create(product: Product): Promise<void>
  abstract save(product: Product): Promise<void>
}
