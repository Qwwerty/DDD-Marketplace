import { ProductsRepository } from '../repositories/products-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { Product, ProductStatus } from '../../enterprise/entities/product'
import { SellersRepository } from '../repositories/sellers-repository'

import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { Injectable } from '@nestjs/common'

interface MarkSellAsSolddUseCaseRequest {
  productId: string
  ownerId: string
}

type MarkSellAsSolddUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    product: Product
  }
>

@Injectable()
export class MarkSellAsSolddUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private sellersRepository: SellersRepository,
  ) {}

  async execute({
    productId,
    ownerId,
  }: MarkSellAsSolddUseCaseRequest): Promise<MarkSellAsSolddUseCaseResponse> {
    const seller = await this.sellersRepository.findById(ownerId)

    if (!seller) {
      return left(new ResourceNotFoundError('ownerId', ownerId))
    }

    const product = await this.productsRepository.findById(productId)

    if (!product) {
      return left(new ResourceNotFoundError('productId', productId))
    }

    if (product.owner.id.toString() !== ownerId) {
      return left(new NotAllowedError())
    }

    if (product.status === ProductStatus.cancelled) {
      return left(new NotAllowedError())
    }

    product.status = ProductStatus.sold

    await this.productsRepository.save(product)

    return right({
      product,
    })
  }
}
