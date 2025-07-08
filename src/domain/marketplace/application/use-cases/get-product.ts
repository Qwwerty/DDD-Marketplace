import { Product } from '../../enterprise/entities/product'
import { ProductsRepository } from '../repositories/products-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

import { Either, left, right } from '@/core/either'

interface GetProductUseCaseRequest {
  productId: string
}

type GetProductUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    product: Product
  }
>

export class GetProductUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    productId,
  }: GetProductUseCaseRequest): Promise<GetProductUseCaseResponse> {
    const product = await this.productsRepository.findById(productId)

    if (!product) {
      return left(new ResourceNotFoundError('product', productId))
    }

    return right({ product })
  }
}
