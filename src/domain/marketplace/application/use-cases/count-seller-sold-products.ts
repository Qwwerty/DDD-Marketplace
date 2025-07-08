import { ProductsRepository } from '../repositories/products-repository'
import { SellersRepository } from '../repositories/sellers-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { ProductStatus } from '../../enterprise/entities/product'

import { Either, left, right } from '@/core/either'

interface CountSellerSoldUseCaseRequest {
  sellerId: string
}

type CountSellerSoldUseCaseRequestResponse = Either<
  ResourceNotFoundError,
  {
    amount: number
  }
>

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

    const products = await this.productsRepository.count({
      sellerId,
      status: ProductStatus.SOLD,
    })

    const amount = products.length

    return right({
      amount,
    })
  }
}
