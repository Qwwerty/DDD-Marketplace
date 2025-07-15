import { Injectable } from '@nestjs/common'

import { Product } from '../../enterprise/entities/product'
import { ProductAttachment } from '../../enterprise/entities/product-attachment'
import { ProductAttachmentList } from '../../enterprise/entities/product-attachments-list'
import { CategoriesRepository } from '../repositories/categories-repository'
import { ProductsRepository } from '../repositories/products-repository'
import { SellersRepository } from '../repositories/sellers-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

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

@Injectable()
export class SellProductUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private categoryRepository: CategoriesRepository,
    private productsRepository: ProductsRepository,
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

    const product = Product.create({
      title,
      description,
      onwer: seller,
      category,
      priceInCents,
    })

    const productAttachments = attachmentsIds.map((attachmentId) =>
      ProductAttachment.create({
        attachmentId: new UniqueEntityId(attachmentId),
        productId: product.id,
      }),
    )

    product.attachments = new ProductAttachmentList(productAttachments)

    try {
      await this.productsRepository.create(product)

      return right({
        product,
      })
    } catch (error) {
      return left(error)
    }
  }
}
