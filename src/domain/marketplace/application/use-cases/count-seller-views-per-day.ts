import { Either, left, right } from '@/core/either'
import { SellersRepository } from '@/domain/marketplace/application/repositories/sellers-repository'
import { ViewsRepository } from '@/domain/marketplace/application/repositories/views-repository'
import { ResourceNotFoundError } from '@/domain/marketplace/application/use-cases/errors/resource-not-found-error'

interface CountSellerViewsPerDayUseCaseRequest {
  sellerId: string
}

type CountSellerViewsPerDayUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    viewsPerDay: {
      date: Date
      amount: number
    }[]
  }
>

export class CountSellerViewsPerDay {
  constructor(
    private sellersRepository: SellersRepository,
    private viewsRepository: ViewsRepository,
  ) {}

  async execute({
    sellerId,
  }: CountSellerViewsPerDayUseCaseRequest): Promise<CountSellerViewsPerDayUseCaseResponse> {
    const seller = await this.sellersRepository.findById(sellerId)

    if (!seller) {
      return left(new ResourceNotFoundError('sellerId', sellerId))
    }

    const viewsPerDay = await this.viewsRepository.countPerDay({ sellerId })

    return right({
      viewsPerDay,
    })
  }
}
