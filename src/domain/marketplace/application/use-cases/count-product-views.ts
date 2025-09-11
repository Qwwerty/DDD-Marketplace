import { Injectable } from '@nestjs/common'

import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { ProductsRepository } from '../repositories/products-repository'
import { ViewsRepository } from '../repositories/views-repository'

import { Either, left, right } from '@/core/either'

interface CountProductViewsUseCaseRequest {
  productId: string
}

type CountProductViewsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    amount: number
  }
>

@Injectable()
export class CountProductViewsUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private viewsRepository: ViewsRepository,
  ) {}

  async execute({
    productId,
  }: CountProductViewsUseCaseRequest): Promise<CountProductViewsUseCaseResponse> {
    const product = await this.productsRepository.findById(productId)

    if (!product) {
      return left(new ResourceNotFoundError('productId', productId))
    }

    const amount = await this.viewsRepository.countByProduct({ productId })

    return right({
      amount,
    })
  }
}
