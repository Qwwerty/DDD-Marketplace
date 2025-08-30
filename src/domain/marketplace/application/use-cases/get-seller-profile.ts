import { Injectable } from '@nestjs/common'

import { SellersRepository } from '../repositories/sellers-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { SellerDetails } from '../../enterprise/entities/value-objects/seller-details'

import { Either, left, right } from '@/core/either'

interface GetSellerProfileUseCaseRequest {
  sellerId: string
}

type GetSellerProfileUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    seller: SellerDetails
  }
>

@Injectable()
export class GetSellerProfileUseCase {
  constructor(private sellersRepository: SellersRepository) {}

  async execute({
    sellerId,
  }: GetSellerProfileUseCaseRequest): Promise<GetSellerProfileUseCaseResponse> {
    const seller = await this.sellersRepository.findDetailsById(sellerId)

    if (!seller) {
      return left(new ResourceNotFoundError('sellerId', sellerId))
    }

    return right({ seller })
  }
}
