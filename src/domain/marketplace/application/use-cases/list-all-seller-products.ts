import { Injectable } from '@nestjs/common'

import { ProductStatus } from '../../enterprise/entities/product'
import { ProductsRepository } from '../repositories/products-repository'
import { SellersRepository } from '../repositories/sellers-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { ProductDetails } from '../../enterprise/entities/value-objects/product-details'

import { Either, left, right } from '@/core/either'

interface ListAllSellerProductsUseCaseRequest {
  sellerId: string
  search?: string
  status?: ProductStatus
}

type ListAllSellerProductsUseCaseRequestResponse = Either<
  ResourceNotFoundError,
  {
    products: ProductDetails[]
  }
>

@Injectable()
export class ListAllSellerProductsUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private productsRepository: ProductsRepository,
  ) {}

  async execute({
    sellerId,
    search,
    status,
  }: ListAllSellerProductsUseCaseRequest): Promise<ListAllSellerProductsUseCaseRequestResponse> {
    const seller = await this.sellersRepository.findById(sellerId)

    if (!seller) {
      return left(new ResourceNotFoundError('sellerId', sellerId))
    }

    const products = await this.productsRepository.findManyByOwner({
      ownerId: sellerId,
      search,
      status,
    })

    return right({
      products,
    })
  }
}
