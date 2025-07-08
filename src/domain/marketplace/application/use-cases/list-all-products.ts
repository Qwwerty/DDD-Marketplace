import { Product, ProductStatus } from '../../enterprise/entities/product'
import { ProductsRepository } from '../repositories/products-repository'

import { Either, right } from '@/core/either'

interface ListAllProductsUseCaseRequest {
  page: number
  search?: string
  status?: ProductStatus
}

type ListAllProductsUseCaseRequestResponse = Either<
  null,
  {
    products: Product[]
  }
>

export class ListAllProductsUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    page,
    search,
    status,
  }: ListAllProductsUseCaseRequest): Promise<ListAllProductsUseCaseRequestResponse> {
    const products = await this.productsRepository.findManyRecent({
      page,
      search,
      status,
    })

    return right({
      products,
    })
  }
}
