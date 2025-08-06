import {
  Prisma,
  Attachment as PrismaAttachment,
  Category as PrismaCategory,
  Product as PrismaProduct,
  User as PrismaUser,
  Status,
} from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { Category } from '@/domain/marketplace/enterprise/entities/category'
import {
  Product,
  ProductStatus,
} from '@/domain/marketplace/enterprise/entities/product'
import { Seller } from '@/domain/marketplace/enterprise/entities/seller'
import { UserAttachment } from '@/domain/marketplace/enterprise/entities/user-attachment'

type TPrismaProduct = PrismaProduct & {
  user: PrismaUser
  category: PrismaCategory
  attachments: PrismaAttachment[]
}

export class PrismaProductMapper {
  static toDomain(raw: TPrismaProduct): Product {
    return Product.create(
      {
        title: raw.title,
        description: raw.description,
        priceInCents: raw.priceInCents,
        status: ProductStatus[raw.status as ProductStatus],
        owner: Seller.create(
          {
            name: raw.user.name,
            phone: raw.user.phone,
            email: raw.user.name,
            password: raw.user.password,
            avatar: raw.user.avatarId
              ? UserAttachment.create({
                  attachmentId: new UniqueEntityId(raw.user.avatarId),
                  userId: new UniqueEntityId(raw.user.id),
                })
              : undefined,
          },
          new UniqueEntityId(raw.user.id),
        ),
        category: Category.create(
          {
            title: raw.category.title,
            slug: raw.category.slug,
          },
          new UniqueEntityId(raw.category.id),
        ),
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(product: Product): Prisma.ProductUncheckedCreateInput {
    return {
      id: product.id.toString(),
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      status: product.status.toUpperCase() as Status,
      categoryId: product.category.id.toString(),
      userId: product.owner.id.toString(),
    }
  }
}
