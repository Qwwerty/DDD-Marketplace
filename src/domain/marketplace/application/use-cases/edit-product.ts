import { Product, ProductStatus } from '../../enterprise/entities/product'
import { ProductAttachment } from '../../enterprise/entities/product-attachment'
import { ProductAttachmentList } from '../../enterprise/entities/product-attachments-list'
import { CategoriesRepository } from '../repositories/categories-repository'
import { ProductsRepository } from '../repositories/products-repository'
import { SellersRepository } from '../repositories/sellers-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { ProductAttachmentsRepository } from '../repositories/product-attachments-repository'

import { Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { Injectable } from '@nestjs/common'
import { ProductDetails } from '../../enterprise/entities/value-objects/product-details'

interface EditProductUseCaseProps {
  productId: string
  ownerId: string
  categoryId: string
  title: string
  description: string
  priceInCents: number
  attachmentsIds: string[]
}

type EditProductUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    product: ProductDetails
  }
>

@Injectable()
export class EditProductUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private categoryRepository: CategoriesRepository,
    private productsRepository: ProductsRepository,
    private productAttachmentsRepository: ProductAttachmentsRepository,
  ) {}

  async execute({
    productId,
    ownerId,
    categoryId,
    title,
    description,
    priceInCents,
    attachmentsIds,
  }: EditProductUseCaseProps): Promise<EditProductUseCaseResponse> {
    const product = await this.productsRepository.findById(productId)

    if (!product) {
      return left(new ResourceNotFoundError('Product', productId))
    }

    if (
      product.status === ProductStatus.SOLD ||
      product.owner.id.toString() !== ownerId
    ) {
      return left(new NotAllowedError())
    }

    const seller = await this.sellersRepository.findById(ownerId)

    if (!seller) {
      return left(new ResourceNotFoundError('Seller', ownerId))
    }

    const category = await this.categoryRepository.findById(categoryId)

    if (!category) {
      return left(new ResourceNotFoundError('Category', categoryId))
    }

    const currentProductAttachments =
      await this.productAttachmentsRepository.findByProductId(productId)

    const productAttachmentList = new ProductAttachmentList(
      currentProductAttachments,
    )

    const productAttachments = attachmentsIds.map((attachmentId) =>
      ProductAttachment.create({
        attachmentId: new UniqueEntityId(attachmentId),
        productId: product.id,
      }),
    )

    productAttachmentList.update(productAttachments)

    product.title = title
    product.description = description
    product.category = category
    product.priceInCents = priceInCents
    product.attachments = productAttachmentList

    try {
      const result = await this.productsRepository.save(product)

      return right({
        product: result,
      })
    } catch (error) {
      return left(error)
    }
  }
}
