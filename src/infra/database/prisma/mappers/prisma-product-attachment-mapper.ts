import { Injectable } from '@nestjs/common'
import { Attachment as PrismaAttachment, Prisma } from '@prisma/client'

import { ProductAttachment } from '@/domain/marketplace/enterprise/entities/product-attachment'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

@Injectable()
export class PrismaProductAttachmentMapper {
  static toDomain(raw: PrismaAttachment): ProductAttachment {
    return ProductAttachment.create(
      {
        productId: new UniqueEntityId(String(raw.productId)),
        attachmentId: new UniqueEntityId(raw.id)
      }
    )
  }


  static toPrismaUpdateMany(
    attachments: ProductAttachment[],
  ): Prisma.AttachmentUpdateManyArgs {
    const attachmentIds = attachments.map((attachment) => {
      return attachment.attachmentId.toString()
    })

    return {
      where: {
        id: {
          in: attachmentIds,
        },
      },
      data: {
        productId: attachments[0].productId.toString(),
      },
    }
  }

  static toPrismaDeleteMany(
    attachments: ProductAttachment[],
  ): Prisma.AttachmentUpdateManyArgs {
    const attachmentIds = attachments.map((attachment) => {
      return attachment.attachmentId.toString()
    })

    return {
      where: {
        id: {
          in: attachmentIds,
        },
      },
      data: {
        productId: attachments[0].productId.toString(),
      },
    }
  }
}
