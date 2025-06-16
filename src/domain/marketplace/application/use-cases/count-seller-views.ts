import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { SellersRepository } from '../repositories/sellers-repository'
import { ViewsRepository } from '../repositories/views-repository'

interface CountSellerViewsUseCaseRequest {
  sellerId: string
}

type CountSellerViewsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    amount: number
  }
>

export class CountSellerViewsUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private viewsRepository: ViewsRepository,
  ) {}

  async execute({
    sellerId,
  }: CountSellerViewsUseCaseRequest): Promise<CountSellerViewsUseCaseResponse> {
    const seller = await this.sellersRepository.findById(sellerId)

    if (!seller) {
      return left(new ResourceNotFoundError('sellerId', sellerId))
    }

    const amount = await this.viewsRepository.countBySeller({ sellerId })

    return right({
      amount,
    })
  }
}
