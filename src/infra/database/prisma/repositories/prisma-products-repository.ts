import { Injectable } from '@nestjs/common'
import { Status } from '@prisma/client'
import dayjs from 'dayjs'

import { PrismaProductMapper } from '../mappers/prisma-product-mapper'
import { PrismaService } from '../prisma.service'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { AttachmentsRepository } from '@/domain/marketplace/application/repositories/attachments-repository'
import {
  ProductAttachmentsRepository,
} from '@/domain/marketplace/application/repositories/product-attachments-repository'
import {
  Count,
  FindMany,
  FindManyByOwner,
  ProductsRepository,
} from '@/domain/marketplace/application/repositories/products-repository'
import { ResourceNotFoundError } from '@/domain/marketplace/application/use-cases/errors/resource-not-found-error'
import { Product } from '@/domain/marketplace/enterprise/entities/product'
import { ProductDetails } from '@/domain/marketplace/enterprise/entities/value-objects/product-details'

@Injectable()
export class PrismaProductsRepository implements ProductsRepository {
  constructor(
    private prisma: PrismaService,
    private productAttachmentsRepository: ProductAttachmentsRepository,
    private attachmentsRepository: AttachmentsRepository,
  ) {}

  async count({ sellerId, status }: Count): Promise<number> {
    const today = dayjs().endOf('day').toDate()
    const thirtyDaysAgo = dayjs().subtract(30, 'day').startOf('day').toDate()

    return this.prisma.product.count({
      where: {
        userId: sellerId,
        createdAt: {
          gte: thirtyDaysAgo,
          lte: today,
        },
        ...(status && { status: status.toUpperCase() as Status }),
      },
    })
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        category: true,
        attachments: true,
      },
    })

    if (!product) {
      return null
    }

    return PrismaProductMapper.toDomain(product)
  }

  findManyByOwner(params: FindManyByOwner): Promise<Product[]> {
    throw new Error('Method not implemented.')
  }

  findManyRecent(params: FindMany): Promise<Product[]> {
    throw new Error('Method not implemented.')
  }

  async create(product: Product): Promise<ProductDetails> {
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

    const data = PrismaProductMapper.toPrisma(product)

    await this.prisma.product.create({
      data,
    })

    await this.productAttachmentsRepository.createMany(
      product.attachments.getItems(),
    )

    const owner = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: product.owner.id.toString(),
      },
      include: {
        attachments: true,
      },
    })

    return ProductDetails.create({
      productId: product.id,
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      status: product.status,
      owner: {
        id: new UniqueEntityId(owner.id),
        name: owner.name,
        phone: owner.phone,
        email: owner.email,
        avatar:
          owner.attachments.length > 0
            ? {
              id: new UniqueEntityId(owner.attachments[0].id),
              path: owner.attachments[0].path,
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

  async save(product: Product): Promise<ProductDetails> {
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

    const data = PrismaProductMapper.toPrisma(product)

    const owner = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: product.owner.id.toString(),
      },
      include: {
        attachments: true,
      },
    })

    await Promise.all([
      this.prisma.product.update({
        where: {
          id: product.id.toString(),
        },
        data,
      }),
      this.productAttachmentsRepository.createMany(
        product.attachments.getItems(),
      ),
      this.productAttachmentsRepository.deleteMany(
        product.attachments.getRemovedItems(),
      ),
    ])

    return ProductDetails.create({
      productId: product.id,
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      status: product.status,
      owner: {
        id: new UniqueEntityId(owner.id),
        name: owner.name,
        phone: owner.phone,
        email: owner.email,
        avatar:
          owner.attachments.length > 0
            ? {
              id: new UniqueEntityId(owner.attachments[0].id),
              path: owner.attachments[0].path,
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
}
