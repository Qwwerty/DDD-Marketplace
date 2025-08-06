import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'

import { InMemoryAttachmentsRepository } from './in-memory-attachments-repository'
import { InMemoryProductAttachmentsRepository } from './in-memory-product-attachments-repository'

import {
  Count,
  FindMany,
  FindManyByOwner,
  ProductsRepository,
} from '@/domain/marketplace/application/repositories/products-repository'
import { ResourceNotFoundError } from '@/domain/marketplace/application/use-cases/errors/resource-not-found-error'
import { Product } from '@/domain/marketplace/enterprise/entities/product'
import { ProductDetails } from '@/domain/marketplace/enterprise/entities/value-objects/product-details'

dayjs.extend(isBetween)

export class InMemoryProductsRepository implements ProductsRepository {
  public items: Product[] = []

  constructor(
    private productAttachmentsRepository: InMemoryProductAttachmentsRepository,
    private attachmentsRepository: InMemoryAttachmentsRepository,
  ) {}

  async count({ sellerId, status }: Count): Promise<number> {
    const filteredProducts = this.items.filter((item) => {
      const targetDate = dayjs(item.createdAt)
      const todayDate = dayjs()
      const thirtyDaysAgo = todayDate.subtract(30, 'day')

      return (
        targetDate.isBetween(thirtyDaysAgo, todayDate, 'day', '[]') &&
        item.onwer.id.toString() === sellerId
      )
    })

    if (status) {
      filteredProducts.filter((item) => item.status === status)
    }

    return filteredProducts.length
  }

  async findById(id: string): Promise<Product | null> {
    const product = this.items.find((item) => item.id.toString() === id)

    if (!product) {
      return null
    }

    return product
  }

  async findManyByOwner({
    ownerId,
    search,
    status,
  }: FindManyByOwner): Promise<Product[]> {
    let filtered = this.items

    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (status) {
      filtered = filtered.filter((item) => item.status === status)
    }

    return filtered.filter((item) => item.onwer.id.toString() === ownerId)
  }

  async findManyRecent({ page, search, status }: FindMany): Promise<Product[]> {
    let filtered = this.items

    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (status) {
      filtered = filtered.filter((item) => item.status === status)
    }

    return filtered
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20)
  }

  async create(product: Product): Promise<ProductDetails> {
    this.items.push(product)

    const attachmentsId = product.attachments.currentItems.map((attachment) =>
      attachment.attachmentId.toString(),
    )

    const {
      hasAll,
      inexistentIds,
      data: attachments,
    } = await this.attachmentsRepository.findManyByIds(attachmentsId)

    if (!hasAll) {
      throw new ResourceNotFoundError('Images', inexistentIds.join(', '))
    }

    await this.productAttachmentsRepository.createMany(
      product.attachments.getItems(),
    )

    const hasAvatar = attachments.find(
      (attachment) => attachment.id === product.onwer.avatar?.attachmentId,
    )

    return ProductDetails.create({
      productId: product.id,
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      status: product.status,
      owner: {
        id: product.onwer.id,
        name: product.onwer.name,
        phone: product.onwer.phone,
        email: product.onwer.email,
        avatar: hasAvatar
          ? {
              id: hasAvatar.id,
              path: hasAvatar.path,
            }
          : undefined,
      },
      category: {
        id: product.category.id,
        title: product.category.title,
        slug: product.category.slug,
      },
      attachments,
    })
  }

  async save(product: Product): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === product.id)

    this.items[itemIndex] = product

    const attachmentsId = product.attachments.currentItems.map((attachment) =>
      attachment.attachmentId.toString(),
    )

    const { hasAll, inexistentIds } =
      await this.attachmentsRepository.findManyByIds(attachmentsId)

    if (!hasAll) {
      throw new ResourceNotFoundError('Images', inexistentIds.join(', '))
    }

    await this.productAttachmentsRepository.createMany(
      product.attachments.getNewItems(),
    )

    await this.productAttachmentsRepository.deleteMany(
      product.attachments.getRemovedItems(),
    )
  }
}
