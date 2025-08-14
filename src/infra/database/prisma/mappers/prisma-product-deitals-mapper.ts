import {
  Product as PrismaProduct,
  User as PrismaUser,
  Category as PrismaCategory,
  Attachment as PrismaAttachment,
} from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { ProductDetails } from '@/domain/marketplace/enterprise/entities/value-objects/product-details'
import { ProductStatus } from '@/domain/marketplace/enterprise/entities/product'

type PrismaProductDetails = PrismaProduct & {
  user: PrismaUser & {
    attachments: PrismaAttachment[]
  },
  category: PrismaCategory
  attachments: PrismaAttachment[]
}

export class PrismaProductDetailsMapper {
  static toDomain(raw: PrismaProductDetails): ProductDetails {
    return ProductDetails.create({
      productId: new UniqueEntityId(raw.id),
      title: raw.title,
      description: raw.description,
      priceInCents: raw.priceInCents,
      status: ProductStatus[raw.status],
      owner: {
        id: new UniqueEntityId(raw.user.id),
        name: raw.user.name,
        phone: raw.user.phone,
        email: raw.user.email,
        avatar: raw.user.attachments.length > 0
          ? {
            id: new UniqueEntityId(raw.user.attachments[0].id),
            path: raw.user.attachments[0].path,
          }
          : undefined,
      },
      category: {
        id: new UniqueEntityId(raw.category.id),
        title: raw.category.title,
        slug: raw.category.slug,
      },
      attachments: raw.attachments.map(attachment => ({
        id: new UniqueEntityId(attachment.id),
        path: attachment.path
      })),
    })
  }
}
