import { Either, left, right } from '@/core/either'
import { ProductsRepository } from '../repositories/products-repository'
import { SellersRepository } from '../repositories/sellers-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { ProductStatus } from '../../enterprise/entities/product'

interface CountSellerAvailableUseCaseRequest {
  sellerId: string
}

type CountSellerAvailableUseCaseRequestResponse = Either<
  ResourceNotFoundError,
  {
    amount: number
  }
>

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

    const products = await this.productsRepository.count({
      sellerId,
      status: ProductStatus.AVAILABLE,
    })

    const amount = products.length

    return right({
      amount,
    })
  }
}
