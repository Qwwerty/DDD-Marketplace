import { ProductsRepository } from '../repositories/products-repository'
import { SellersRepository } from '../repositories/sellers-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { ProductStatus } from '../../enterprise/entities/product'

import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'

interface CountSellerSoldUseCaseRequest {
  sellerId: string
}

type CountSellerSoldUseCaseRequestResponse = Either<
  ResourceNotFoundError,
  {
    amount: number
  }
>

@Injectable()
export class CountSellerSoldUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private productsRepository: ProductsRepository,
  ) {}

  async execute({
    sellerId,
  }: CountSellerSoldUseCaseRequest): Promise<CountSellerSoldUseCaseRequestResponse> {
    const seller = await this.sellersRepository.findById(sellerId)

    if (!seller) {
      return left(new ResourceNotFoundError('sellerId', sellerId))
    }

    const amount = await this.productsRepository.count({
      sellerId,
      status: ProductStatus.sold,
    })

    return right({
      amount,
    })
  }
}
