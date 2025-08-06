import { ProductsRepository } from '../repositories/products-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { Product, ProductStatus } from '../../enterprise/entities/product'
import { SellersRepository } from '../repositories/sellers-repository'

import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'

interface MarkSellAsAvaiableUseCaseRequest {
  productId: string
  ownerId: string
}

type MarkSellAsAvaiableUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    product: Product
  }
>

export class MarkSellAsAvailableUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private sellersRepository: SellersRepository,
  ) {}

  async execute({
    productId,
    ownerId,
  }: MarkSellAsAvaiableUseCaseRequest): Promise<MarkSellAsAvaiableUseCaseResponse> {
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

    if (product.status === ProductStatus.SOLD) {
      return left(new NotAllowedError())
    }

    product.status = ProductStatus.AVAILABLE

    this.productsRepository.save(product)

    return right({
      product,
    })
  }
}
