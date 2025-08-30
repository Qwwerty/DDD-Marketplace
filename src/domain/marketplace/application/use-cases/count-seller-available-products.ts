import { Injectable } from '@nestjs/common'

import { ProductsRepository } from '../repositories/products-repository'
import { SellersRepository } from '../repositories/sellers-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { ProductStatus } from '../../enterprise/entities/product'

import { Either, left, right } from '@/core/either'

interface CountSellerAvailableUseCaseRequest {
  sellerId: string
}

type CountSellerAvailableUseCaseRequestResponse = Either<
  ResourceNotFoundError,
  {
    amount: number
  }
>

@Injectable()
export class CountSellerAvailableUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private productsRepository: ProductsRepository,
  ) {}

  async execute({
    sellerId,
  }: CountSellerAvailableUseCaseRequest): Promise<CountSellerAvailableUseCaseRequestResponse> {
    const seller = await this.sellersRepository.findById(sellerId)

    if (!seller) {
      return left(new ResourceNotFoundError('sellerId', sellerId))
    }

    const amount = await this.productsRepository.count({
      sellerId,
      status: ProductStatus.available,
    })

    return right({
      amount,
    })
  }
}
