import { Either, left, right } from '@/core/either'

import { Product } from '../../enterprise/entities/product'
import { AttachmentsRepository } from '../repositories/attachments-repository'
import { CategoriesRepository } from '../repositories/categories-repository'
import { SellersRepository } from '../repositories/sellers-repository'
import { ProductsRepository } from '../repositories/products-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface SellProductUseCaseProps {
  ownerId: string
  categoryId: string
  title: string
  description: string
  priceInCents: number
  attachmentsIds: string[]
}

type SellProductUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    product: Product
  }
>

export class SellProductUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private categoryRepository: CategoriesRepository,
    private productsRepository: ProductsRepository,
    private attachmentsRepository: AttachmentsRepository,
  ) {}

  async execute({
    ownerId,
    categoryId,
    title,
    description,
    priceInCents,
    attachmentsIds,
  }: SellProductUseCaseProps): Promise<SellProductUseCaseResponse> {
    const seller = await this.sellersRepository.findById(ownerId)

    if (!seller) {
      return left(new ResourceNotFoundError('Seller', ownerId))
    }

    const category = await this.categoryRepository.findById(categoryId)

    if (!category) {
      return left(new ResourceNotFoundError('Category', categoryId))
    }

    const { hasAll, inexistentIds } =
      await this.attachmentsRepository.findManyByIds(attachmentsIds)

    if (!hasAll) {
      return left(new ResourceNotFoundError('Images', inexistentIds.join(', ')))
    }

    const product = Product.create({
      title,
      description,
      onwer: seller,
      category,
      priceInCents,
    })

    await this.productsRepository.create(product)

    return right({
      product,
    })
  }
}
