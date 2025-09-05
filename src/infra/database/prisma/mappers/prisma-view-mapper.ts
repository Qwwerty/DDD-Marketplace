import {
  Prisma,
  View as PrismaView,
  User as PrismaUser,
  Product as PrismaProduct,
  Category as PrismaCategory,
  Attachment as PrismaAttachment,
} from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { ProductStatus } from '@/domain/marketplace/enterprise/entities/product'
import { ViewDetails } from '@/domain/marketplace/enterprise/entities/value-objects/view-details'
import { View } from '@/domain/marketplace/enterprise/entities/view'

type TPrismaView = PrismaView & {
  user: PrismaUser & {
    attachments: PrismaAttachment[]
  }
  product: PrismaProduct & {
    user: PrismaUser & {
      attachments: PrismaAttachment[]
    }
    category: PrismaCategory
    attachments: PrismaAttachment[]
  }
}

export class PrismaViewMapper {
  static toPrisma(view: View): Prisma.ViewUncheckedCreateInput {
    return {
      id: view.id.toString(),
      viewerId: view.viewer.id.toString(),
      productId: view.product.id.toString(),
      createdAt: view.createdAt
    }
  }

  static toDomain(raw: TPrismaView): ViewDetails {
    return ViewDetails.create({
      viewer: {
        id: new UniqueEntityId(raw.user.id),
        name: raw.user.name,
        email: raw.user.email,
        phone: raw.user.phone,
        avatar:
          raw.user.attachments.length > 0
            ? {
                id: raw.user.attachments[0].id,
                path: raw.user.attachments[0].path,
              }
            : null,
      },
      product: {
        productId: new UniqueEntityId(raw.product.id),
        title: raw.product.title,
        description: raw.product.description,
        priceInCents: raw.product.priceInCents,
        status: ProductStatus[raw.product.status.toLowerCase()],
        owner: {
          id: new UniqueEntityId(raw.product.user.id),
          name: raw.product.user.name,
          phone: raw.product.user.phone,
          email: raw.product.user.email,
          avatar:
            raw.product.user.attachments.length > 0
              ? {
                  id: new UniqueEntityId(raw.product.user.attachments[0].id),
                  path: raw.product.user.attachments[0].path,
                }
              : null,
        },
        category: {
          id: new UniqueEntityId(raw.product.category.id),
          title: raw.product.category.title,
          slug: raw.product.category.slug,
        },
        attachments: raw.product.attachments.map((attachment) => ({
          id: new UniqueEntityId(attachment.id),
          path: attachment.path,
        })),
      },
    })
  }
}
