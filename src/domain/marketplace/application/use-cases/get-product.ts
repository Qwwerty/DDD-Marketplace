import { Injectable } from '@nestjs/common'

import { ProductsRepository } from '../repositories/products-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

import { Either, left, right } from '@/core/either'
import { ProductDetails } from '@/domain/marketplace/enterprise/entities/value-objects/product-details'

interface GetProductUseCaseRequest {
  productId: string
}

type GetProductUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    product: ProductDetails
  }
>

@Injectable()
export class GetProductUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    productId,
  }: GetProductUseCaseRequest): Promise<GetProductUseCaseResponse> {
    const product = await this.productsRepository.findByIdWithDetails(productId)

    if (!product) {
      return left(new ResourceNotFoundError('product', productId))
    }

    return right({ product })
  }
}
